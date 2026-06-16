export default async function handler(req, res) {
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            message: 'API aktif'
        });
    }

    if (req.method === 'POST') {
        return res.status(200).json({
            success: true,
            data: req.body
        });
    }

    return res.status(405).json({
        success: false,
        message: 'Method not allowed'
    });
}
