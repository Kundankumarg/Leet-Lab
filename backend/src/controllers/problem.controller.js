import {db} from "../libs/db.js";
import { poolBatchResults, submitBatch } from "../libs/judge0.lib.js";
import { getJudeg0LanguageId } from "../libs/judge0.lib.js";


export const createProblem = async (req, res) => {
    const { title, description, difficulty, tags, example, constraints, testCases, codeSnippets, referenceSolution } = req.body;

    // going to check the user role once again
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({
            message: "You are not allowed to create a problem"
        });
    }

    try {

        for (const [language, solutionCode] of Object.entries(referenceSolution)){

            const languageId = getJudeg0LanguageId(language);

            if(!languageId){
                return res.status(400).json({
                    error:`Language ${language} is not supported`
                })
            }

            const submissions= testCases.map(({input, output}) => ({
                language_id: languageId,
                source_code: solutionCode,
                stdin: input,
                expected_output:output
            }))

            const submissionResult = await submitBatch(submissions);
            const tokens = submissionResult.map((res) => res.token);
            const results = await poolBatchResults(tokens);

            
        }
    }
    catch (err) {

    }
}

export const getAllProblems = async (req, res) => { }

export const getProblemById = async (req, res) => { }

export const updateProblem = async (req, res) => { }

export const deleteProblem = async (req, res) => { }

export const getAllProblemsSolvedByUser = async (req, res) => { }



