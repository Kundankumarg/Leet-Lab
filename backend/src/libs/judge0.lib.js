

export const getJudeg0LanguageId = (language) => {
    const languageMap = {
        "python": 71,
        "javascript": 63,
        "java": 62,
        "c": 50,
        "c++": 54,
    }

    return languageMap[language.toUpperCase()] || null;
}

export const submitBatch = async (submissions) => {

        const {data} = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,{submissions})

        console.log(data);
        return data; // [{token:},{token:},{token:}]

}

const Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const poolBatchResults = async (tokens) => {
    while (true) {
        const {data} = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`,{
            params:{
                tokens:tokens.join(","),
                base64_encoded:false,
            }
        })

        const results = data.submissions;

        const isAllDone = results.every(
            (r) => r.status.id !== 1 && result.status.id !== 2
        );

        if (isAllDone) {
            return results;
        }
        await Sleep(1000); // wait for 1 second before polling again      
    }
}