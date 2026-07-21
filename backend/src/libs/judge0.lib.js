import axios from "axios";

console.log("URL =", process.env.CODEBOX_API_URL);
console.log("TOKEN =", process.env.CODEBOX_TOKEN);

export const getJudeg0LanguageId = (language) => {
    const languageMap = {
        python: 71,
        javascript: 63,
        java: 62,
        c: 50,
        cpp: 54,
    };

    return languageMap[language.toLowerCase()] || null;
};

export const submitBatch = async (submissions) => {

    console.log("Submitting to CodeBox...");
    console.log("URL:", `${process.env.CODEBOX_API_URL}/submissions/batch?base64_encoded=false`);

    console.log("TOKEN =", process.env.CODEBOX_TOKEN);
    console.log("API URL =", process.env.CODEBOX_API_URL);

    const { data } = await axios.post(
        `${process.env.CODEBOX_API_URL}/submissions/batch?base64_encoded=false`,
        { submissions },
        {
            headers: {
                "X-Auth-Token": process.env.CODEBOX_TOKEN,
            },
        }
    );

    console.log("CODEBOX Response:", data);

    return data;
}

const Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const poolBatchResults = async (tokens) => {

    let retries = 20;

    while (retries--) {

        const { data } = await axios.get(
            `${process.env.CODEBOX_API_URL}/submissions/batch`,
            {
                params: {
                    tokens: tokens.join(","),
                    base64_encoded: false,
                },
                headers: {
                    "X-Auth-Token":
                        process.env.CODEBOX_TOKEN,
                },
            }
        );

        const results = data.submissions;

        console.log("Polling CodeBox...");
        console.log(results);

        const isAllDone =
            results.every(
                r =>
                    r.status.id !== 1 &&
                    r.status.id !== 2
            );

        if (isAllDone) {
            return results;
        }

        await Sleep(10000);
    }

    throw new Error(
        "Polling timeout"
    );
};