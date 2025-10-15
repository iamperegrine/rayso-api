import { RaySo, InvalidParameterException } from "rayso";

const raySoConfig = (params) => ({
    title: params.title,
    theme: params.theme,
    padding: params.padding,
    language: params.language,
    background: params.background,
    darkMode: params.darkMode,
});

const errorResponse = (res, status, message) => {
    res.status(status).json({ error: message });
};

const handleRaySo = async (req, res, code) => {
    try {
        if (!code) {
            errorResponse(res, 400, "Code parameter is missing.");
            return;
        }

        const params = req.method === "GET" ? req.query : req.body;
        const raySo = new RaySo(raySoConfig(params));
        const response = await raySo.cook(code);

        res.setHeader("Content-Type", "image/jpeg");
        res.send(response);
    } catch (error) {
        if (error instanceof InvalidParameterException) {
            errorResponse(res, 400, error.message);
        } else {
            console.error(error);
            errorResponse(res, 500, "An Internal Server Error.");
        }
    }
};

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === "GET") {
        const code = req.query.code;
        await handleRaySo(req, res, code);
    } else if (req.method === "POST") {
        const code = req.body.code;
        await handleRaySo(req, res, code);
    } else {
        errorResponse(res, 405, "Method not allowed. Use GET or POST.");
    }
}

