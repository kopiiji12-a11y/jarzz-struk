export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    const data = req.body;

    console.log('Struk masuk:', data);

    return res.status(200).json({
        success: true,
        message: 'Data diterima',
        data
    });
}
