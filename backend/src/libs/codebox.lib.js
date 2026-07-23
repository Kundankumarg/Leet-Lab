import axios from "axios";

console.log(
    "CODEBOX URL =",
    process.env.CODEBOX_API_URL
);

console.log(
    "CODEBOX TOKEN =",
    process.env.CODEBOX_TOKEN
);

export const getLanguageId = (
    language
) => {

    const languageMap = {
        python: 71,
        javascript: 63,
        java: 62,
        c: 50,
        cpp: 54,
    };

    return (
        languageMap[
            language.toLowerCase()
        ] || null
    );
};

export const submitBatch =
    async (submissions) => {

        console.log(
            "Submitting to CodeBox..."
        );

        const { data } =
            await axios.post(
                `${process.env.CODEBOX_API_URL}/submissions/batch?base64_encoded=false`,
                {
                    submissions
                },
                {
                    headers: {
                        "X-Auth-Token":
                            process.env.CODEBOX_TOKEN,
                    },
                }
            );

        console.log(
            "CodeBox Response:",
            data
        );

        return data;
    };

const sleep = (ms) =>
    new Promise(
        resolve =>
            setTimeout(resolve, ms)
    );

export const poolBatchResults =
    async (tokens) => {

        let retries = 60;

        while (retries--) {

            const { data } =
                await axios.get(
                    `${process.env.CODEBOX_API_URL}/submissions/batch`,
                    {
                        params: {
                            tokens:
                                tokens.join(","),
                            base64_encoded:
                                false,
                        },
                        headers: {
                            "X-Auth-Token":
                                process.env.CODEBOX_TOKEN,
                        },
                    }
                );

            const results =
                data.submissions;

            console.log(
                "Polling CodeBox..."
            );

            console.log(
                results
            );

            const isAllDone =
                results.every(
                    r =>
                        r.status.id !== 1 &&
                        r.status.id !== 2
                );

            if (isAllDone) {
                return results;
            }

            // wait 10 seconds
            await sleep(1000);
        }

        throw new Error(
            "CodeBox polling timeout"
        );
    };