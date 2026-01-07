/**
 * RisLis Agent - Main Logic
 * No-Build Vanilla JS
 */

// Mock State
const state = {
    user: { name: 'Tony Yu', role: 'Personal User' },
    activeTasks: [],
    files: [
        { id: 1, name: '中国平安_医疗险_8839.pdf', type: 'policy', date: '2025-01-01', size: '2.4 MB' },
        { id: 2, name: '和睦家_发票_001.jpg', type: 'invoice', date: '2024-12-28', size: '1.8 MB' }
    ],
    events: [
        { id: 1, action: '系统初始化', desc: 'RisLis 智能体已激活', time: '2025-01-01 10:00' },
        { id: 2, action: '保单绑定', desc: '用户上传并绑定了平安医疗险', time: '2025-01-01 10:05' }
    ],
    isListening: false,
    view: 'home',
    currentDraft: null
};

import { MockAI } from './mock-services.js';

// DOM Elements
const els = {
    viewContainer: document.getElementById('main-view')
};

// DOM Helper
const render = (html) => {
    const container = document.getElementById('main-view');
    if (container) container.innerHTML = html;
};

// Helper Component: Drawer
const getDrawer = (activeTab) => `
    <div class="bottom-drawer">
        <div class="drawer-handle"></div>
        <nav class="drawer-nav">
            <a href="#" class="nav-item ${activeTab === 'home' ? 'active' : ''}" data-target="home"><i class="bi bi-grid-fill"></i>首页</a>
            <a href="#" class="nav-item ${activeTab === 'files' ? 'active' : ''}" data-target="files"><i class="bi bi-file-earmark-text-fill"></i>文件</a>
            <a href="#" class="nav-item ${activeTab === 'events' ? 'active' : ''}" data-target="events"><i class="bi bi-chat-dots-fill"></i>动态</a>
        </nav>
    </div>
`;

// Views
const Views = {
    home: () => {
        const hasTasks = state.activeTasks.length > 0;
        const tasksHtml = hasTasks
            ? state.activeTasks.map(task => `
                <div class="task-card active-item">
                    <div class="task-icon ${task.type === 'claim' ? 'icon-claim' : 'icon-policy'}">
                        <i class="bi ${task.type === 'claim' ? 'bi-file-medical-fill' : 'bi-shield-check'}"></i>
                    </div>
                    <div class="task-info">
                        <h3>${task.title}</h3>
                        <span class="task-status">${task.status}</span>
                    </div>
                    <div class="task-time">${task.time}</div>
                </div>
            `).join('')
            : `
                <div class="task-card empty-state">
                    <i class="bi bi-shield-check"></i>
                    <p>暂无进行中案件，保障即刻护航。</p>
                </div>
            `;

        const connectedCount = state.connectedCompanies ? state.connectedCompanies.length : 0;

        return `
        <div id="view-home" class="view active">
            <div class="hero-section">
                <h1>今天有什么可以帮您？</h1>
                <p class="subtitle">意图驱动保险智能体</p>
            </div>
            
            <!-- Channel Status Entry -->
            <div class="channel-status-card" onclick="window.openChannels()">
                <div class="channel-info">
                    <h3 style="font-size:0.95rem; margin-bottom:4px;">RisLis Link <span style="font-size:0.7rem; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; margin-left:8px; border:1px solid rgba(255,255,255,0.2);">LIVE</span></h3>
                    <p style="font-size:0.75rem; color:var(--color-text-muted);">
                        ${connectedCount > 0 ? `<span style="color:var(--color-success)">●</span> 已连接 ${connectedCount} 个数据源` : '未连接保险公司数据源'}
                    </p>
                </div>
                <div class="channel-icon-group">
                    <div class="channel-indicators">
                        ${connectedCount > 0
                ? state.connectedCompanies.map(c => `<div class="channel-logo-mini" style="background:${c.color}; color:#fff;">${c.name[0]}</div>`).join('')
                : '<div class="channel-logo-mini"><i class="bi bi-plus"></i></div>'
            }
                    </div>
                    <i class="bi bi-chevron-right" style="color:var(--color-text-muted); font-size:0.8rem;"></i>
                </div>
            </div>

            <div class="active-tasks">
                ${tasksHtml}
            </div>

            <div class="red-button-container">
                <button id="the-red-button" class="red-button">
                    <div class="mic-icon"><i class="bi bi-mic-fill"></i></div>
                    <span class="button-label">按住说话</span>
                </button>
                <div class="input-actions">
                    <button class="action-btn" id="btn-camera"><i class="bi bi-camera-fill"></i></button>
                    <button class="action-btn" id="btn-text"><i class="bi bi-keyboard-fill"></i></button>
                </div>
            </div>
            ${getDrawer('home')}
        </div>
    `},


    chat: () => `
        <div id="view-chat" class="view active view-chat">
            <div class="chat-header">
                <button class="back-btn" onclick="window.resetApp()"><i class="bi bi-arrow-left"></i></button>
                <h2>文字指令</h2>
            </div>
            
            <div class="chat-container">
                <div class="chat-messages" id="chat-messages">
                    <div class="chat-bubble bot">
                        我是 RisLis，您的保险智能体。<br>请告诉我您需要创建的案件或询问的保单详情。
                    </div>
                </div>

                <div class="chat-input-area">
                    <textarea class="chat-input" id="chat-input" placeholder="输入指令 (例如: '帮我创建一个医疗理赔案件')..." autofocus></textarea>
                    <div class="chat-actions">
                        <button class="send-btn" id="send-btn" onclick="window.sendMessage()">发送 <i class="bi bi-arrow-up-short"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `,

    files: () => `
        <div id="view-files" class="view active">
            <div class="view-header" style="padding:24px 24px 0; display:flex; justify-content:space-between; align-items:center;">
                <h2>文件中心</h2>
                <button class="action-btn" style="width:36px; height:36px; font-size:1rem;"><i class="bi bi-plus-lg"></i></button>
            </div>
            <div class="file-list" style="padding:24px; display:flex; flex-direction:column; gap:16px;">
                ${state.files.map(f => `
                    <div class="file-item" style="display:flex; align-items:center; gap:16px; background:rgba(255,255,255,0.05); padding:16px; border-radius:16px;">
                        <div class="file-icon ${f.type}" style="font-size:1.5rem; color:${f.type === 'policy' ? 'var(--color-primary)' : 'var(--color-accent)'}">
                            <i class="bi ${f.type === 'policy' ? 'bi-file-earmark-pdf-fill' : 'bi-file-earmark-image-fill'}"></i>
                        </div>
                        <div class="file-info" style="flex:1;">
                            <h4 style="font-size:0.95rem; margin-bottom:4px;">${f.name}</h4>
                            <span style="font-size:0.75rem; color:var(--color-text-muted);">${f.date} • ${f.size}</span>
                        </div>
                        <button class="more-btn" style="background:none; border:none; color:var(--color-text-muted); padding:8px;"><i class="bi bi-three-dots-vertical"></i></button>
                    </div>
                `).join('')}
            </div>
            ${getDrawer('files')}
        </div>
    `,

    events: () => `
        <div id="view-events" class="view active">
            <div class="view-header" style="padding:24px;">
                <h2>动态日志</h2>
            </div>
            <div class="timeline" style="padding:0 24px 100px 24px;">
                ${state.events.slice().reverse().map(e => `
                    <div class="timeline-item" style="display:flex; gap:16px; margin-bottom:24px; position:relative;">
                        <div class="timeline-line" style="position:absolute; left:7px; top:24px; bottom:-30px; width:2px; background:rgba(255,255,255,0.1);"></div>
                        <div class="timeline-dot" style="width:16px; height:16px; border-radius:50%; background:var(--color-accent); margin-top:4px; flex-shrink:0; border:4px solid rgba(59,130,246,0.2);"></div>
                        <div class="timeline-content">
                            <span class="timeline-time" style="font-size:0.75rem; color:var(--color-text-muted); display:block; margin-bottom:4px;">${e.time}</span>
                            <h4 style="font-size:1rem; margin-bottom:4px;">${e.action}</h4>
                            <p style="font-size:0.9rem; color:var(--color-text-muted); line-height:1.5;">${e.desc}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${getDrawer('events')}
        </div>
    `,

    processing: () => `
        <div class="view-processing">
            <div class="skeleton-loader">
                <div class="scan-line"></div>
                <div class="skeleton-header"></div>
                <div class="skeleton-block"></div>
                <div class="skeleton-block short"></div>
                <div class="skeleton-block"></div>
            </div>
            <p class="status-text">正在解析文档...<br><span class="sub-status">预审官：检查影像质量中</span></p>
            <button class="cancel-btn">取消</button>
        </div>
    `,

    confirmBind: (data) => `
        <div class="view-confirm">
            <div class="confirmation-card">
                <div class="card-header">
                    <span class="badge-success">准备绑定</span>
                    <i class="bi bi-check-circle-fill success-icon"></i>
                </div>
                <div class="policy-preview">
                    <div class="carrier-logo">${data.carrier_name[0]}</div>
                    <div class="policy-details">
                        <h3>${data.product_name}</h3>
                        <p class="policy-no">保单号 •••• ${data.policy_no_last4}</p>
                    </div>
                </div>
                <div class="data-grid">
                    <div class="data-item">
                        <label>被保人</label>
                        <span>${data.insured_name}</span>
                    </div>
                    <div class="data-item">
                        <label>有效期至</label>
                        <span>${data.expiry_date}</span>
                    </div>
                    <div class="data-item full">
                        <label>文档类型</label>
                        <span>${data.document_type}</span>
                    </div>
                </div>
            </div>
            
            <div class="action-footer">
                <button class="btn-primary" onclick="window.confirmBindAction()">确认并绑定</button>
                <button class="btn-secondary" onclick="window.resetApp()">重拍</button>
            </div>
        </div>
    `,

    shadowReport: (report) => `
        <div class="view-shadow">
            <div class="shadow-report-card">
                <div class="card-header">
                    <span class="badge-warning">影子验证模式 (Shadow Mode)</span>
                    <i class="bi bi-shield-lock-fill" style="color:var(--color-warning)"></i>
                </div>
                <div class="report-content">
                    <div class="rating-circle">${report.rating}级</div>
                    <h3 style="text-align:center; margin-bottom:20px;">风险分析报告</h3>
                    
                    ${report.risk_points.map(p => `
                        <div class="risk-item">
                            <span class="risk-text">${p.text}</span>
                            <span class="risk-citation">来源: ${p.citation}</span>
                        </div>
                    `).join('')}

                    <div style="margin-top:20px; padding:12px; background:rgba(255,255,255,0.05); border-radius:12px;">
                        <span style="color:var(--color-success); font-size:0.9rem; font-weight:600;">智能建议:</span>
                        <p style="font-size:0.9rem; margin-top:4px;">${report.recommendation}</p>
                    </div>
                </div>
            </div>

            <div class="action-footer">
                <button class="btn-primary danger-glow" onclick="window.finalSubmitAction()">确认知晓并提交</button>
                <button class="btn-secondary" onclick="window.resetApp()">取消</button>
            </div>
        </div>
    `,

    draftProposal: (draft) => `
        <div class="view-draft">
            <div class="draft-card">
                <div class="card-header">
                    <span class="badge-blue"><i class="bi bi-stars"></i> 建议创建案件</span>
                </div>
                <div class="draft-content">
                    <h2 class="draft-title">${draft.category}</h2>
                    <p class="draft-summary">${draft.summary}</p>
                    
                    <div class="extracted-fields">
                        ${Object.entries(draft.extracted_fields).map(([key, val]) => `
                            <div class="field-pill">
                                <i class="bi bi-check2"></i> ${val}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="action-suggestions">
                <p class="section-label">下一步建议 (Action UI)</p>
                <div class="action-chips">
                    ${draft.next_actions.map(action => `
                        <button class="action-chip">
                            <i class="bi ${action.icon}"></i> ${action.label}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="action-footer">
                <button class="btn-primary" onclick="window.confirmDraftAction()">确认创建 (Yes)</button>
                <button class="btn-secondary" onclick="window.resetApp()">修改 (Edit)</button>
            </div>
        </div>
    `,

    channels: () => `
        <div id="view-channels" class="view active">
            <div class="view-header" style="padding:24px; display:flex; align-items:center; gap:12px;">
                <button class="back-btn" onclick="window.resetApp()"><i class="bi bi-arrow-left"></i></button>
                <h2>连接保险数据源</h2>
            </div>
            <p style="padding:0 24px; color:var(--color-text-muted); font-size:0.9rem;">
                连接后，RisLis 将通过加密专线实时同步您的保单权益与理赔进度。
            </p>

            <div class="channel-grid">
                <!-- PingAn -->
                <div class="company-card" onclick="window.connectToCompany('pingan', '中国平安', '#ff6b00')">
                    <div class="company-logo-lg" style="color:#ff6b00">平</div>
                    <h4 class="company-name">中国平安</h4>
                    <span class="connection-status">点击连接</span>
                    
                    <!-- Hover Overlay -->
                    <div class="service-overlay">
                        <div class="service-title">可对接服务能力</div>
                        <ul class="service-list">
                            <li>全量保单同步</li>
                            <li>闪赔绿色通道</li>
                            <li>电子发票调取</li>
                        </ul>
                    </div>
                </div>
                
                <!-- AIA -->
                <div class="company-card" onclick="window.connectToCompany('aia', '友邦保险', '#d31145')">
                    <div class="company-logo-lg" style="color:#d31145">A</div>
                    <h4 class="company-name">友邦保险</h4>
                    <span class="connection-status">点击连接</span>
                     <div class="service-overlay">
                        <div class="service-title">可对接服务能力</div>
                        <ul class="service-list">
                            <li>高端医疗直付</li>
                            <li>保单权益查询</li>
                        </ul>
                    </div>
                </div>
                
                <!-- ZA -->
                <div class="company-card" onclick="window.connectToCompany('za', '众安保险', '#00b0b9')">
                    <div class="company-logo-lg" style="color:#00b0b9">Z</div>
                    <h4 class="company-name">众安保险</h4>
                    <span class="connection-status">点击连接</span>
                     <div class="service-overlay">
                        <div class="service-title">可对接服务能力</div>
                        <ul class="service-list">
                            <li>航延险自动赔</li>
                            <li>宠物险报销</li>
                        </ul>
                    </div>
                </div>
                
                 <!-- TaiKang -->
                <div class="company-card" onclick="window.connectToCompany('taikang', '泰康人寿', '#7fb038')">
                    <div class="company-logo-lg" style="color:#7fb038">泰</div>
                    <h4 class="company-name">泰康人寿</h4>
                    <span class="connection-status">点击连接</span>
                     <div class="service-overlay">
                        <div class="service-title">可对接服务能力</div>
                        <ul class="service-list">
                            <li>养老社区预约</li>
                            <li>健保通直连</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `,

    connecting: (data) => `
        <div id="view-connecting" class="view active view-connecting">
            <h2 style="margin-bottom:40px; font-size:1.5rem;">建立加密专线</h2>
            
            <div class="connection-stage" id="connection-stage">
                <div class="node pulse" id="node-left">
                    <i class="bi bi-cpu-fill node-icon"></i>
                    <span class="node-label">RisLis Core</span>
                </div>

                <div class="connection-line-container">
                    <div class="connection-line-active"></div>
                </div>

                <div class="node" id="node-right">
                    <div class="company-logo-lg" style="width:50px; height:50px; font-size:1.2rem; margin:0; border:none; box-shadow:none; color:${data.color}">${data.name[0]}</div>
                    <span class="node-label">${data.name} Host</span>
                </div>
            </div>

            <div class="terminal-log" id="terminal-log">
                <!-- Logs will appear here -->
            </div>

            <!-- Capabilities Manifest Card (Hidden by default) -->
            <div class="capabilities-card" id="capabilities-card">
                <div class="cap-header">
                    <span class="cap-title">协议握手确认 (PROTOCOL ACK)</span>
                    <i class="bi bi-patch-check-fill" style="color:var(--color-success)"></i>
                </div>
                <div class="cap-list">
                    <div class="cap-item">
                        <span>实时数据同步协议</span>
                        <span class="cap-status">[已激活]</span>
                    </div>
                    <div class="cap-item">
                        <span>保单权益查询接口</span>
                        <span class="cap-status">[已授权]</span>
                    </div>
                    <div class="cap-item">
                        <span>极速理赔绿色通道</span>
                        <span class="cap-status">[就绪]</span>
                    </div>
                    <div class="cap-item">
                        <span>电子发票直连桥接</span>
                        <span class="cap-status">[已连接]</span>
                    </div>
                </div>
                <button class="btn-acknowledge" onclick="window.acknowledgeConnection('${data.id}', '${data.name}', '${data.color}')">
                    >> 确认协议并激活 (ACTIVATE)
                </button>
            </div>
        </div>
    `
};

// Initializer
function init() {
    console.log('RisLis Agent Initialized');
    render(Views.home());
    attachListeners();
}

window.resetApp = () => {
    state.view = 'home'; // Reset view state
    render(Views.home());
    attachListeners();
};

// Actions
window.confirmDraftAction = () => {
    state.activeTasks.unshift({
        id: Date.now(),
        title: '医疗理赔申请',
        status: '材料待补全',
        time: '刚刚',
        type: 'claim'
    });

    // Log event
    state.events.push({
        id: Date.now(),
        action: '创建案件',
        desc: '通过语音创建了医疗理赔案件草稿',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    alert("✅ 案件已创建 (Case Created)\n已添加至任务列表。");
    window.resetApp();
};

window.confirmBindAction = async () => {
    console.log("Triggering Shadow Mode...");
    render(`
        <div class="view-processing">
            <div class="skeleton-loader">
                <div class="scan-line"></div>
                <div class="skeleton-header"></div>
                <div class="skeleton-block"></div>
                <div class="skeleton-block short"></div>
            </div>
            <p class="status-text">生成影子报告中...</p>
        </div>
    `);

    try {
        const report = await MockAI.generateShadowReport({});
        render(Views.shadowReport(report));
    } catch (e) {
        alert("验证失败");
        window.resetApp();
    }
};

window.finalSubmitAction = () => {
    state.activeTasks.unshift({
        id: Date.now(),
        title: '保单绑定：中国平安',
        status: '已生效',
        time: '刚刚',
        type: 'policy'
    });

    // Log event
    state.events.push({
        id: Date.now(),
        action: '影子验证通过',
        desc: '保单已绑定并生成风险报告 B 级',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    alert("🚀 提交成功！\nToken Generated: tok_8839_xb9\n已更新任务列表");
    window.resetApp();
};

window.sendMessage = async () => {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');

    if (!input || !input.value.trim()) return;

    const text = input.value.trim();

    // Add user message
    messages.innerHTML += `
        <div class="chat-bubble user">
            ${text}
        </div>
    `;
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    // Simulate thinking/response
    setTimeout(async () => {
        try {
            // Re-use handleVoiceInput logic or simple mock
            // For now, let's treat it as an intent trigger
            const draft = await MockAI.analyzeIntent();
            render(Views.draftProposal(draft));
        } catch (e) {
            messages.innerHTML += `
                <div class="chat-bubble bot">
                    抱歉，我没有理解您的指令，请重试。
                </div>
            `;
            messages.scrollTop = messages.scrollHeight;
        }
    }, 1000);
};

function attachListeners() {
    const btnRed = document.getElementById('the-red-button');
    const btnCam = document.getElementById('btn-camera');
    const btnTxt = document.getElementById('btn-text');

    // Navigation Tabs
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.addEventListener('click', (e) => {
            e.preventDefault();
            const target = nav.getAttribute('data-target');
            if (target && Views[target]) {
                state.view = target;
                render(Views[target]());
                attachListeners(); // Re-bind listeners for new elements
            }
        });
    });

    // Bottom Drawer Mobile Toggle
    const drawer = document.querySelector('.bottom-drawer');
    if (drawer) {
        // Toggle on handle click or when collapsed
        drawer.addEventListener('click', (e) => {
            const isHandle = e.target.classList.contains('drawer-handle') || e.target.closest('.drawer-handle');
            const isCollapsed = !drawer.classList.contains('expanded');

            // If clicking handle, or clicking anywhere while collapsed -> toggle
            if (isHandle || isCollapsed) {
                drawer.classList.toggle('expanded');
            }
        });
    }

    if (btnRed) {
        const startListening = () => {
            state.isListening = true;
            btnRed.classList.add('listening');
            btnRed.querySelector('.button-label').textContent = '正在聆听...';
        };

        const stopListening = () => {
            if (!state.isListening) return;
            state.isListening = false;
            btnRed.classList.remove('listening');
            btnRed.querySelector('.button-label').textContent = '按住说话';
            handleVoiceInput();
        };

        btnRed.addEventListener('mousedown', startListening);
        btnRed.addEventListener('mouseup', stopListening);
        btnRed.addEventListener('mouseleave', stopListening);
        btnRed.addEventListener('touchstart', (e) => { e.preventDefault(); startListening(); });
        btnRed.addEventListener('touchend', (e) => { e.preventDefault(); stopListening(); });
    }

    if (btnCam) {
        btnCam.addEventListener('click', () => {
            showSnapInterface();
        });
    }

    if (btnTxt) {
        btnTxt.addEventListener('click', () => {
            state.view = 'chat';
            render(Views.chat());
            attachListeners(); // Re-bind for back button
        });
    }
}


// UI Flows
function showSnapInterface() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleSnapUpload(file);
        }
    };
    input.click();
}

async function handleSnapUpload(file) {
    console.log("正在处理文件：", file.name);
    render(Views.processing());

    try {
        const gkResult = await MockAI.validateImage(file);
        if (gkResult.status === 'FAIL') {
            alert(`⚠️ 预审官提醒：${gkResult.issues.join(', ')}\n请重新拍摄。`);
            window.resetApp();
            return;
        }
        const data = await MockAI.extractPolicyData(file);
        render(Views.confirmBind(data));
    } catch (e) {
        console.error(e);
        alert("系统错误：无法处理影像。");
        window.resetApp();
    }
}

async function handleVoiceInput() {
    render(`
        <div class="view-processing">
            <div class="skeleton-loader">
                <div class="scan-line"></div>
                <div class="skeleton-header"></div>
                <div class="skeleton-block"></div>
            </div>
            <p class="status-text">正在分析意图...</p>
        </div>
    `);

    try {
        const draft = await MockAI.analyzeIntent();
        render(Views.draftProposal(draft));
    } catch (e) {
        alert("意图识别失败");
        window.resetApp();
    }
}

// Connection Logic
window.openChannels = () => {
    state.view = 'channels';
    render(Views.channels());
};

window.connectToCompany = (id, name, color) => {
    state.view = 'connecting';
    const companyData = { id, name, color };
    render(Views.connecting(companyData)); // Re-render to show layout first

    // Start Animation Sequence
    const logContainer = document.getElementById('terminal-log');
    const stage = document.getElementById('connection-stage');
    const rightNode = document.getElementById('node-right');

    const addLog = (text, type = 'normal') => {
        if (!logContainer) return;
        const div = document.createElement('div');
        div.className = `log-line ${type}`;
        div.innerHTML = `> ${text}`;
        logContainer.appendChild(div);
        logContainer.scrollTop = logContainer.scrollHeight;
    };

    setTimeout(() => addLog("Initializing secure handshake protocol..."), 500);
    setTimeout(() => {
        addLog("Resolving host address: connect.api." + id + ".com...");
        stage.classList.add('connecting'); // trigger dotted line flow
    }, 1500);

    setTimeout(() => addLog("Handshake SYN sent. Waiting for ACK...", "warn"), 2500);

    setTimeout(() => {
        addLog("ACK received. Establishing SSL/TLS tunnel...", "success");
        rightNode.classList.add('pulse'); // animate right node
    }, 4000);

    setTimeout(() => {
        addLog("Verifying identity certificates...");
    }, 5000);

    setTimeout(() => {
        addLog("Connection ESTABLISHED. Pipeline Active.", "success");
        stage.classList.remove('connecting');
        stage.classList.add('connected-state'); // solid line glow
        document.getElementById('node-left').classList.add('success-pulse');
        rightNode.classList.add('success-pulse');
    }, 6500);

    setTimeout(() => {
        // Instead of Alert, show the Capabilities Card
        const capCard = document.getElementById('capabilities-card');
        if (capCard) capCard.classList.add('show');
    }, 7500);
};

window.acknowledgeConnection = (id, name, color) => {
    // Save state
    if (!state.connectedCompanies) state.connectedCompanies = [];
    state.connectedCompanies.push({ id, name, color });

    // Optional: Add a log entry to daily events
    state.events.push({
        id: Date.now(),
        action: '加密专线已建立',
        desc: `与 [${name}] 的数据同步协议已激活`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    window.resetApp();
};

// Boot
document.addEventListener('DOMContentLoaded', init);
