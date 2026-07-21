import { db } from "../libs/db.js";
import {
    poolBatchResults,
    submitBatch,
    getLanguageId
} from "../libs/codebox.lib.js";

const sleep = (ms) =>
    new Promise(resolve =>
        setTimeout(resolve, ms)
    );

export const createProblem = async (req, res) => {

    const {
        title,
        description,
        difficulty,
        tags,
        example,
        constraints,
        testCases,
        codeSnippets,
        referenceSolutions
    } = req.body;

    if (req.user.role !== "ADMIN") {
        return res.status(403).json({
            message:
                "You are not allowed to create a problem"
        });
    }

    try {

        for (
            const [language, solutionCode]
            of Object.entries(referenceSolutions)
        ) {

            console.log(
                `\n========== ${language} ==========\n`
            );

            const languageId =
                getLanguageId(language);

            if (!languageId) {
                return res.status(400).json({
                    error:
                        `Language ${language} is not supported`
                });
            }

            let results = [];

            // Java, C and C++ sequential execution
            if (
                language === "JAVA" ||
                language === "CPP" ||
                language === "C"
            ) {

                for (
                    let i = 0;
                    i < testCases.length;
                    i++
                ) {

                    const tc =
                        testCases[i];

                    console.log(
                        `Running testcase ${i + 1}`
                    );

                    const submissionResult =
                        await submitBatch([
                            {
                                language_id:
                                    languageId,
                                source_code:
                                    solutionCode,
                                stdin:
                                    tc.input,
                                expected_output:
                                    tc.output
                            }
                        ]);

                    const tokens =
                        submissionResult.map(
                            r => r.token
                        );

                    const result =
                        await poolBatchResults(
                            tokens
                        );

                    results.push(
                        result[0]
                    );

                    // Important for Java/C/C++
                    await sleep(2000);
                }

            } else {

                // Python and JavaScript batch execution
                const submissions =
                    testCases.map(
                        ({ input, output }) => ({
                            language_id:
                                languageId,
                            source_code:
                                solutionCode,
                            stdin:
                                input,
                            expected_output:
                                output
                        })
                    );

                const submissionResult =
                    await submitBatch(
                        submissions
                    );

                const tokens =
                    submissionResult.map(
                        r => r.token
                    );

                results =
                    await poolBatchResults(
                        tokens
                    );
            }

            for (
                let i = 0;
                i < results.length;
                i++
            ) {

                const result =
                    results[i];

                console.log(
                    "Language:",
                    language
                );

                console.log(
                    "Status:",
                    result.status
                );

                console.log(
                    "Stdout:",
                    result.stdout
                );

                console.log(
                    "Expected:",
                    testCases[i].output
                );

                console.log(
                    "Result-------",
                    result
                );

                if (
                    result.status.id !== 3
                ) {

                    return res.status(400).json({
                        error:
                            `Testcase ${i + 1} failed for language ${language}`,
                        details: result
                    });
                }
            }
        }

        const newProblem =
            await db.problem.create({
                data: {
                    title,
                    description,
                    difficulty,
                    tags,
                    example,
                    constraints,
                    testCases,
                    codeSnippets,
                    referenceSolutions,
                    userId:
                        req.user.id,
                }
            });

        return res.status(201).json({
            newProblem,
            message:
                "Problem created successfully"
        });

    } catch (err) {

        console.error(
            "Error creating problem:",
            err
        );

        return res.status(500).json({
            error:
                "An error occurred while creating the problem"
        });
    }
};

export const getAllProblems = async (req, res) => { };

export const getProblemById = async (req, res) => { };

export const updateProblem = async (req, res) => { };

export const deleteProblem = async (req, res) => { };

export const getAllProblemsSolvedByUser =
    async (req, res) => { };