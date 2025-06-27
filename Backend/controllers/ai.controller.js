import * as ai from "../services/ai.service.js";


export const getAiResponse = async (req , res)=>{
    try{
        
        const { prompt } = req.query;
        
        const response = await ai.generateResponse(prompt);

        res.send(response);

    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}