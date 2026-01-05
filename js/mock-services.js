/**
 * Mock AI Services for RisLis MVP
 * Simulates backend latency and structure responses
 */

export const MockAI = {
    // 6. Gatekeeper (Check Quality)
    validateImage: async (file) => {
        // Simulate Network Delay (800ms)
        await new Promise(r => setTimeout(r, 800));

        // MVP: Always pass for demo unless file name contains "bad"
        const isBad = file.name.includes('bad');

        if (isBad) {
            return {
                status: 'FAIL', // or WARN
                issues: ['文字模糊', '检测到反光'],
                action: 'RETAKE'
            };
        }

        return { status: 'PASS', issues: [] };
    },

    // 4. Snap & Bind (OCR & Extraction)
    extractPolicyData: async (file) => {
        // Simulate Processing Delay (2000ms - Show Skeleton)
        await new Promise(r => setTimeout(r, 2000));

        return {
            document_type: '保险单',
            carrier_name: '中国平安',
            product_name: '全球医疗保障计划（金卡版）',
            policy_no_last4: '8839',
            insured_name: 'Tony Yu',
            effective_date: '2025-01-01',
            expiry_date: '2026-01-01',
            confidence: 0.98
        };
    },

    // 7. Shadow Mode Report
    generateShadowReport: async (caseData) => {
        await new Promise(r => setTimeout(r, 1500));

        return {
            rating: 'B', // A/B/C
            risk_points: [
                { text: '牙科责任有30天等待期限制', citation: '第 4.2 条款' },
                { text: '非网络医院就诊免赔额较高', citation: '第 3 页, 表 A' }
            ],
            recommendation: '建议优先前往网络医院就诊，可避免20%的自付比例。'
        };
    },

    // 5. Case Draft (Intent Analysis)
    analyzeIntent: async (input) => {
        // Simulate thinking
        await new Promise(r => setTimeout(r, 1800));

        return {
            intent: 'CREATE_CASE',
            category: '医疗理赔',
            summary: '用户反馈在上海和睦家医院进行了牙科治疗，询问是否可以理赔以及需要哪些材料。',
            extracted_fields: {
                hospital: '上海和睦家医院',
                date: '2025-01-05',
                symptom: '牙齿疼痛/治疗'
            },
            next_actions: [
                { type: 'upload', label: '上传医疗发票', icon: 'bi-receipt' },
                { type: 'upload', label: '上传病历本', icon: 'bi-journal-medical' },
                { type: 'map', label: '确认就诊地点', icon: 'bi-geo-alt' }
            ]
        };
    }
};
