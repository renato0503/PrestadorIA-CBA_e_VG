// --- SIMULAÇÃO DE ESTADO E CONFIGURAÇÃO ---

// Simulando o estado da conversa
let conversationState = {
    currentService: null,
    currentQuestionIndex: 0,
    answers: {},
    leads: [], // Armazenará leads salvos localmente
    metrics: {
        estimatesGiven: 0,
        leadsSaved: 0,
        errorsEncountered: 0
    }
};

// Carregar estado do localStorage se existir
function loadState() {
    const savedState = localStorage.getItem('chatbotState');
    if (savedState) {
        conversationState = JSON.parse(savedState);
        // Garantir que lead e metrics existam caso o estado salvo esteja incompleto
        if (!conversationState.leads) conversationState.leads = [];
        if (!conversationState.metrics) conversationState.metrics = { estimatesGiven: 0, leadsSaved: 0, errorsEncountered: 0 };
    }
    console.log("Estado carregado:", conversationState);
}

// Salvar estado no localStorage
function saveState() {
    localStorage.setItem('chatbotState', JSON.stringify(conversationState));
    console.log("Estado salvo:", conversationState);
}

// Carregar configurações do arquivo JSON (simulado via fetch)
let serviceConfig = {};
async function loadConfig() {
    try {
        // Em um ambiente real, faríamos um fetch:
        // const response = await fetch('data/config.json');
        // serviceConfig = await response.json();

        // Para simulação em arquivo único, usamos o JSON diretamente:
        serviceConfig = {
          "services": {
            "gesseiro": {
              "displayName": "Gesseiro",
              "questions": [
                { "id": "area_m2", "text": "Qual a área total em metros quadrados (m²) a ser trabalhada com gesso?", "type": "number", "unit": "m²", "validation": { "type": "range", "min": 1, "max": 500 }, "errorMessage": "Por favor, insira um valor numérico válido entre 1 e 500 m²." },
                { "id": "tipo_gesso", "text": "Qual tipo de gesso será utilizado?", "type": "select", "options": [ {"value": "convencional", "label": "Gesso Convencional (Placas/Paredes)"}, {"value": "acartonado", "label": "Gesso Acartonado (Drywall)"}, {"value": "decorativo", "label": "Gesso Decorativo (Molduras, Sancas)"} ], "validation": { "type": "required" }, "errorMessage": "Por favor, selecione um tipo de gesso." },
                { "id": "detalhes_adicionais", "text": "Possui detalhes adicionais como sancas, molduras ou rebaixamento especial?", "type": "boolean", "validation": { "type": "required" }, "errorMessage": "Por favor, responda sim ou não." },
                { "id": "cor_gesso", "text": "Qual a cor desejada para o acabamento final do gesso (se aplicável)?", "type": "color", "dependency": { "questionId": "tipo_gesso", "value": "decorativo" }, "defaultValue": "#FFFFFF", "validation": { "type": "hexcolor" }, "errorMessage": "Por favor, insira um código de cor hexadecimal válido (ex: #FF5733)." }
              ],
              "pricing_rules": { "base_price_per_m2": 35.00, "material_multiplier": 1.1, "decoration_sanca_fee": 150.00, "drywall_multiplier": 1.3, "color_fee_per_m2": 10.00, "min_price": 300.00, "max_price": 2500.00 }
            },
            "marceneiro": {
              "displayName": "Marceneiro",
              "questions": [
                { "id": "tipo_mobiliar", "text": "Qual tipo de móvel ou serviço de marcenaria você precisa?", "type": "text", "validation": { "type": "minLength", "value": 5 }, "errorMessage": "Por favor, descreva o móvel ou serviço com pelo menos 5 caracteres." },
                { "id": "medidas_altura_cm", "text": "Qual a altura aproximada em cm?", "type": "number", "unit": "cm", "validation": { "type": "range", "min": 10, "max": 300 }, "errorMessage": "Insira uma altura válida em cm (10-300)." },
                { "id": "medidas_largura_cm", "text": "Qual a largura aproximada em cm?", "type": "number", "unit": "cm", "validation": { "type": "range", "min": 10, "max": 300 }, "errorMessage": "Insira uma largura válida em cm (10-300)." },
                { "id": "medidas_profundidade_cm", "text": "Qual a profundidade aproximada em cm?", "type": "number", "unit": "cm", "validation": { "type": "range", "min": 5, "max": 150 }, "errorMessage": "Insira uma profundidade válida em cm (5-150)." },
                { "id": "material_principal", "text": "Qual o material principal desejado?", "type": "select", "options": [ {"value": "mdf", "label": "MDF"}, {"value": "compensado", "label": "Compensado"}, {"value": "madeira_macica", "label": "Madeira Maciça (Ex: Pinus, Cedro)"}, {"value": "outros", "label": "Outros"} ], "validation": { "type": "required" }, "errorMessage": "Por favor, selecione um material." },
                { "id": "cor_acabamento", "text": "Qual a cor ou tipo de acabamento desejado?", "type": "color", "validation": { "type": "hexcolor", "allow_text": true }, "defaultValue": "#8B4513", "errorMessage": "Insira um código de cor hexadecimal (ex: #f0f0f0) ou nome da cor (ex: 'Madeira Clara')." }
              ],
              "pricing_rules": { "price_per_cm2_mdf": 0.05, "price_per_cm2_compensado": 0.07, "price_per_cm2_madeira_macica": 0.10, "price_per_cm2_outros": 0.08, "finishing_fee": 50.00, "assembly_fee_per_hour": 60.00, "min_price": 200.00, "max_price": 5000.00 }
            },
            "marmoreiro": {
              "displayName": "Marmoreiro",
              "questions": [
                { "id": "tipo_superficie", "text": "Qual o tipo de superfície a ser feita/revestida?", "type": "select", "options": [ {"value": "bancada_cozinha", "label": "Bancada de Cozinha"}, {"value": "bancada_banheiro", "label": "Bancada de Banheiro"}, {"value": "piso", "label": "Piso"}, {"value": "parede", "label": "Revestimento de Parede"}, {"value": "soleira", "label": "Soleira/Peitoril"}, {"value": "outros", "label": "Outros"} ], "validation": { "type": "required" }, "errorMessage": "Por favor, selecione o tipo de superfície." },
                { "id": "area_m2", "text": "Qual a área total em metros quadrados (m²) a ser coberta?", "type": "number", "unit": "m²", "validation": { "type": "range", "min": 0.1, "max": 50 }, "errorMessage": "Por favor, insira um valor numérico válido entre 0.1 e 50 m²." },
                { "id": "material_escolhido", "text": "Qual o tipo de pedra/material você prefere?", "type": "select", "options": [ {"value": "granito", "label": "Granito"}, {"value": "marmore_branco", "label": "Mármore Branco (Carrara, etc.)"}, {"value": "quartzito", "label": "Quartzito"}, {"value": "superficie_quartzo", "label": "Superfície de Quartzo (Tecnocimento)"}, {"value": "outros", "label": "Outros"} ], "validation": { "type": "required" }, "errorMessage": "Por favor, selecione o material." },
                { "id": "cor_pedra", "text": "Qual a cor ou padrão desejado para a pedra?", "type": "color", "validation": { "type": "hexcolor", "allow_text": true }, "defaultValue": "#D3D3D3", "errorMessage": "Insira um código de cor hexadecimal (ex: #B8860B) ou nome da cor (ex: 'Branco Paraná')." },
                { "id": "tipo_acabamento_borda", "text": "Qual o tipo de acabamento desejado para as bordas (ex: boleada, reta, 45 graus)?", "type": "text", "dependency": { "questionId": "tipo_superficie", "value": ["bancada_cozinha", "bancada_banheiro"] }, "validation": { "type": "minLength", "value": 3 }, "errorMessage": "Descreva o acabamento da borda com pelo menos 3 caracteres." }
              ],
              "pricing_rules": { "price_per_m2_granito": 600.00, "price_per_m2_marmore_branco": 800.00, "price_per_m2_quartzito": 750.00, "price_per_m2_superficie_quartzo": 900.00, "price_per_m2_outros": 700.00, "processing_fee_per_m2": 150.00, "edge_finishing_fee": 80.00, "installation_fee_base": 100.00, "installation_fee_per_m2": 50.00, "min_price": 500.00, "max_price": 10000.00 }
            },
            "pintor": {
              "displayName": "Pintor",
              "questions": [
                { "id": "tipo_ambiente", "text": "Qual o tipo de ambiente a ser pintado?", "type": "select", "options": [ {"value": "interno_res", "label": "Residencial (Interno)"}, {"value": "externo_res", "label": "Residencial (Externo)"}, {"value": "comercial_int", "label": "Comercial (Interno)"}, {"value": "comercial_ext", "label": "Comercial (Externo)"}, {"value": "fachada", "label": "Fachada"} ], "validation": { "type": "required" }, "errorMessage": "Por favor, selecione o tipo de ambiente." },
                { "id": "area_m2", "text": "Qual a área total em metros quadrados (m²) a ser pintada (paredes e teto)?", "type": "number", "unit": "m²", "validation": { "type": "range", "min": 5, "max": 1000 }, "errorMessage": "Por favor, insira um valor numérico válido entre 5 e 1000 m²." },
                { "id": "quantidade_demãos", "text": "Quantas demãos de tinta são necessárias?", "type": "number", "unit": "demãos", "defaultValue": 2, "validation": { "type": "range", "min": 1, "max": 5 }, "errorMessage": "Por favor, insira um número de demãos válido (1-5)." },
                { "id": "cor_desejada", "text": "Qual a cor principal desejada?", "type": "color", "validation": { "type": "hexcolor", "allow_text": true }, "defaultValue": "#FFFFFF", "errorMessage": "Insira um código de cor hexadecimal (ex: #FFD700) ou nome da cor (ex: 'Branco Neve')." },
                { "id": "tipo_pintura", "text": "Qual o tipo de pintura (ex: acrílica, esmalte, textura)?", "type": "text", "validation": { "type": "minLength", "value": 4 }, "errorMessage": "Descreva o tipo de pintura com pelo menos 4 caracteres." }
              ],
              "pricing_rules": { "price_per_m2_interno_res": 25.00, "price_per_m2_externo_res": 35.00, "price_per_m2_comercial_int": 30.00, "price_per_m2_comercial_ext": 40.00, "price_per_m2_fachada": 45.00, "price_per_demao_extra": 5.00, "texture_fee_per_m2": 15.00, "min_price": 250.00, "max_price": 8000.00 }
            }
          }
        };
        console.log("Configuração carregada.");
        setupServiceButtons();
    } catch (error) {
        console.error("Erro ao carregar a configuração:", error);
        displayBotMessage("Desculpe, não foi possível carregar as configurações do serviço. Tente novamente mais tarde.");
        incrementMetric('errorsEncountered');
    }
}

// --- FUNÇÕES DE RENDERIZAÇÃO DA UI ---

function displayBotMessage(message, options = {}) {
    const chatOutput = document.getElementById('chat-output');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', 'bot-message');
    msgDiv.innerHTML = `<p>${message}</p>`; // Usar <p> para garantir quebra de linha se necessário

    // Adicionar botões de sugestão se houver
    if (options.suggestions && options.suggestions.length > 0) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.id = 'input-suggestions';
        suggestionsDiv.classList.add('mt-2');
        options.suggestions.forEach(suggestion => {
            const btn = document.createElement('button');
            btn.classList.add('btn', 'btn-outline-secondary', 'btn-sm');
            btn.textContent = suggestion.label;
            btn.onclick = () => handleUserResponse(suggestion.value);
            suggestionsDiv.appendChild(btn);
        });
        msgDiv.appendChild(suggestionsDiv);
    }

    chatOutput.appendChild(msgDiv);
    chatOutput.scrollTop = chatOutput.scrollHeight; // Auto-scroll
}

function displayUserMessage(message) {
    const chatOutput = document.getElementById('chat-output');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', 'user-message');
    msgDiv.innerHTML = `<p>${message}</p>`;
    chatOutput.appendChild(msgDiv);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

function setupServiceButtons() {
    const serviceSelectionDiv = document.getElementById('service-selection');
    if (!serviceSelectionDiv) return;

    const services = serviceConfig.services;
    for (const serviceKey in services) {
        const btn = document.createElement('button');
        btn.classList.add('btn', 'btn-primary', 'btn-lg');
        btn.textContent = services[serviceKey].displayName;
        btn.onclick = () => selectService(serviceKey);
        serviceSelectionDiv.appendChild(btn);
    }
}

function showChatInput() {
    document.getElementById('chat-input-area').style.display = 'block';
    document.getElementById('service-selection').style.display = 'none'; // Esconde seleção inicial
}

function hideChatInput() {
     document.getElementById('chat-input-area').style.display = 'none';
}

function showLoadingIndicator(show) {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
        indicator.style.display = show ? 'block' : 'none';
    }
    // Desabilitar input enquanto carrega
    const input = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    if(input) input.disabled = show;
    if(sendButton) sendButton.disabled = show;
}

function clearErrorMessage() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = '';
    }
}

function showErrorMessage(message) {
     const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
    }
}

// --- LÓGICA DO FLUXO DE CONVERSA ---

function selectService(serviceKey) {
    console.log(`Serviço selecionado: ${serviceKey}`);
    conversationState.currentService = serviceKey;
    conversationState.currentQuestionIndex = 0;
    conversationState.answers = {}; // Limpa respostas anteriores
    showChatInput();
    askQuestion();
    saveState(); // Salva após seleção do serviço
}

function askQuestion() {
    clearErrorMessage();
    const serviceKey = conversationState.currentService;
    if (!serviceKey || !serviceConfig.services[serviceKey]) {
        displayBotMessage("Por favor, selecione um serviço primeiro.");
        return;
    }

    const questions = serviceConfig.services[serviceKey].questions;
    const currentQuestionIndex = conversationState.currentQuestionIndex;

    if (currentQuestionIndex < questions.length) {
        const questionData = questions[currentQuestionIndex];

        // Verificar dependências
        if (questionData.dependency) {
            const dependencyValue = conversationState.answers[questionData.dependency.questionId];
            let conditionMet = false;

            if (Array.isArray(questionData.dependency.value)) {
                conditionMet = questionData.dependency.value.includes(dependencyValue);
            } else {
                conditionMet = dependencyValue === questionData.dependency.value;
            }

            if (!conditionMet) {
                // Pula a pergunta se a dependência não for atendida
                conversationState.currentQuestionIndex++;
                askQuestion();
                return;
            }
        }

        let questionText = questionData.text;
        if (questionData.unit) {
            questionText += ` (${questionData.unit})`;
        }

        const options = questionData.options;
        const suggestions = options ? options.map(opt => ({ value: opt.value, label: opt.label })) : null;

        displayBotMessage(questionText, suggestions ? { suggestions } : {});

        // Configurar input baseado no tipo de pergunta
        setupInputForQuestion(questionData);

    } else {
        // Fim das perguntas, ir para cálculo e visualização
        displayBotMessage("Ótimo! Chegamos ao final das perguntas. Calculando seu orçamento...");
        hideChatInput();
        showLoadingIndicator(true);
        setTimeout(computePrice, 1500); // Simula processamento e chama a função de cálculo
    }
}

function setupInputForQuestion(questionData) {
    const userInput = document.getElementById('user-input');
    const inputSuggestions = document.getElementById('input-suggestions');
    inputSuggestions.innerHTML = ''; // Limpa sugestões anteriores

    userInput.value = ''; // Limpa o input
    // Usa 'text' para number para permitir placeholder e validação customizada, depois ajusta inputmode
    userInput.type = questionData.type === 'number' ? 'text' : questionData.type;
    userInput.placeholder = `Ex: ${questionData.defaultValue !== undefined ? questionData.defaultValue : 'Sua resposta'}`;
    userInput.setAttribute('aria-label', questionData.text);

    // Remover listeners anteriores para evitar duplicidade
    const oldSendButton = document.getElementById('send-button');
    const newSendButton = oldSendButton.cloneNode(true);
    oldSendButton.parentNode.replaceChild(newSendButton, oldSendButton);
    // Adiciona novo listener ao botão de enviar
    newSendButton.onclick = () => handleUserResponseWrapper();

    // Habilitar/desabilitar conforme o tipo
    if (questionData.type === 'select' || questionData.type === 'boolean') {
        userInput.style.display = 'none'; // Esconde input de texto, usa botões de sugestão
        const suggestionsDiv = document.getElementById('input-suggestions');
        if (suggestionsDiv) {
            suggestionsDiv.style.display = 'block';
            const btns = [];
            if (questionData.type === 'boolean') {
                btns.push({ value: 'true', label: 'Sim' });
                btns.push({ value: 'false', label: 'Não' });
            } else if (questionData.options) {
                btns.push(...questionData.options);
            }
            btns.forEach(btnData => {
                const btn = document.createElement('button');
                btn.classList.add('btn', 'btn-outline-secondary', 'btn-sm');
                btn.textContent = btnData.label;
                btn.onclick = () => handleUserResponse(btnData.value);
                suggestionsDiv.appendChild(btn);
            });
        }
    } else {
        userInput.style.display = 'block';
        const suggestionsDiv = document.getElementById('input-suggestions');
        if (suggestionsDiv) suggestionsDiv.style.display = 'none';
        // Define o tipo mais específico se for number ou color
        if (questionData.type === 'number') {
             userInput.setAttribute('inputmode', 'numeric');
        } else if (questionData.type === 'color') {
             userInput.setAttribute('inputmode', 'url'); // Ou 'text' genérico
             userInput.placeholder = "Ex: #FF5733 ou Vermelho";
        }
    }
}

function handleUserResponseWrapper() {
    const userInput = document.getElementById('user-input');
    handleUserResponse(userInput.value);
}

function handleUserResponse(response) {
    clearErrorMessage();
    const serviceKey = conversationState.currentService;
    const questions = serviceConfig.services[serviceKey].questions;
    const currentQuestionIndex = conversationState.currentQuestionIndex;
    const questionData = questions[currentQuestionIndex];

    if (!questionData) return; // Segurança

    // 1. Validar Resposta
    let validationError = validateResponse(response, questionData);
    if (validationError) {
        showErrorMessage(validationError);
        // Se for select/boolean, a resposta já foi tratada via botão. Se for texto/numérico, mostra erro e aguarda nova entrada.
        if (questionData.type !== 'select' && questionData.type !== 'boolean') {
            return; // Não avança se a validação falhar para inputs de texto/numérico
        }
    }

    // 2. Armazenar Resposta (usar valor padrão se disponível e não houver erro)
    let finalResponse = response;
    // Se houve erro na validação manual E existe um default, usa o default
    if (validationError && questionData.defaultValue !== undefined) {
        finalResponse = questionData.defaultValue;
    }
    // Conversões de tipo
    else if (questionData.type === 'boolean') {
        finalResponse = response === 'true'; // Converte para boolean
    } else if (questionData.type === 'number' && !isNaN(parseFloat(finalResponse))) {
        finalResponse = parseFloat(finalResponse);
    } else if (questionData.type === 'color' && finalResponse.trim() === '' && questionData.defaultValue) {
        finalResponse = questionData.defaultValue; // Usa default se o campo de cor estiver vazio
    } else if (questionData.type === 'text' && finalResponse.trim() === '' && questionData.defaultValue) {
         finalResponse = questionData.defaultValue; // Usa default se o campo de texto estiver vazio
    } else if (questionData.type === 'text' && finalResponse.trim() === '' && !questionData.defaultValue) {
        // Se for texto, vazio, e sem default, e não for obrigatório, pode ser considerado válido como vazio.
        // Mas se for obrigatório, a validação acima já teria pego.
    }


    // Se a validação passou OU a entrada foi tratada com default/valor padrão, armazena e avança
    if (!validationError || questionData.defaultValue !== undefined || (finalResponse === '' && !questionData.validation?.type === 'required')) {
        conversationState.answers[questionData.id] = finalResponse;
        displayUserMessage(formatUserResponse(finalResponse, questionData));
        conversationState.currentQuestionIndex++;
        saveState(); // Salva o estado após cada resposta válida
        askQuestion();
    }
}


function validateResponse(response, questionData) {
    const validation = questionData.validation;
    if (!validation) return null; // Sem validação

    const value = response;

    // Validação de Obrigatório
    if (validation.type === 'required' && (value === null || value === undefined || value === '')) {
        return questionData.errorMessage || "Este campo é obrigatório.";
    }

    // Se o valor está vazio mas não é obrigatório, considera válido (permitindo pular perguntas opcionais)
    if (value === null || value === undefined || value === '') {
        return null;
    }

    // Validações específicas por tipo
    switch (validation.type) {
        case 'range':
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue < validation.min || numValue > validation.max) {
                return questionData.errorMessage || `Por favor, insira um valor entre ${validation.min} e ${validation.max}.`;
            }
            break;
        case 'minLength':
            if (typeof value !== 'string' || value.length < validation.value) {
                 return questionData.errorMessage || `Por favor, insira pelo menos ${validation.value} caracteres.`;
            }
            break;
        case 'hexcolor':
            const hexRegex = /^#([0-9A-Fa-f]{3}){1,2}$/;
            const textInput = typeof value === 'string' && !value.startsWith('#');
            if (textInput && validation.allow_text) {
                // Permite texto livre se 'allow_text' for true
                return null;
            }
            if (!hexRegex.test(value)) {
                return questionData.errorMessage || "Formato inválido. Use #RRGGBB ou #RGB.";
            }
            break;
        // Adicionar outros tipos de validação conforme necessário
    }

    return null; // Válido
}

// Formata a resposta do usuário para exibição
function formatUserResponse(response, questionData) {
    if (questionData.type === 'boolean') {
        return response ? 'Sim' : 'Não';
    }
    if (questionData.type === 'number' && questionData.unit) {
        // Formata números com duas casas decimais, se apropriado (ex: área)
        if (typeof response === 'number' && !Number.isInteger(response)) {
            return `${response.toFixed(2)} ${questionData.unit}`;
        }
        return `${response} ${questionData.unit}`;
    }
     if (questionData.type === 'color') {
        // Tenta mostrar a cor se for hexadecimal válida, senão mostra o texto
        const hexRegex = /^#([0-9A-Fa-f]{3}){1,2}$/;
        if (typeof response === 'string' && hexRegex.test(response)) {
             // Cria um pequeno quadrado colorido para feedback visual
             return `<span style="display: inline-block; width: 15px; height: 15px; background-color: ${response}; vertical-align: middle; margin-right: 5px; border: 1px solid #ccc;"></span> ${response}`;
        }
    }
    // Retorna a resposta como string (pode ser texto, número formatado ou cor textual)
    return String(response);
}

// --- MOTOR DE PRECIFICAÇÃO ---

function computePrice() {
    const serviceKey = conversationState.currentService;
    const config = serviceConfig.services[serviceKey];
    const answers = conversationState.answers;
    const rules = config.pricing_rules;
    let calculatedPrice = 0;
    let explanation = [];

    console.log("Iniciando cálculo com:", answers);

    // Lógica de precificação específica para cada serviço
    switch (serviceKey) {
        case 'gesseiro':
            let area = parseFloat(answers.area_m2) || 0;
            let pricePerM2 = rules.base_price_per_m2;

            if (answers.tipo_gesso === 'acartonado') {
                pricePerM2 *= rules.drywall_multiplier;
            }

            calculatedPrice = area * pricePerM2;

            if (answers.detalhes_adicionais) {
                calculatedPrice += rules.decoration_sanca_fee;
                explanation.push(`Taxa adicional por detalhes (sancas/rebaixamento): R$ ${rules.decoration_sanca_fee.toFixed(2)}`);
            }
            // Considera cor apenas se for decorativo e diferente do default
            if (answers.cor_gesso && answers.cor_gesso !== config.questions.find(q => q.id === 'cor_gesso').defaultValue) {
                 calculatedPrice += area * rules.color_fee_per_m2;
                 explanation.push(`Custo adicional por pintura/cor: R$ ${(area * rules.color_fee_per_m2).toFixed(2)}`);
            }

            explanation.push(`Base (R$ ${pricePerM2.toFixed(2)}/m²): R$ ${(area * pricePerM2).toFixed(2)}`);
            calculatedPrice *= rules.material_multiplier; // Adiciona margem de material
            explanation.push(`Margem de material (+${(rules.material_multiplier - 1) * 100}%): R$ ${(calculatedPrice / rules.material_multiplier * (rules.material_multiplier - 1)).toFixed(2)}`);

            break;

        case 'marceneiro':
            let height = parseFloat(answers.medidas_altura_cm) || 0;
            let width = parseFloat(answers.medidas_largura_cm) || 0;
            let depth = parseFloat(answers.medidas_profundidade_cm) || 0;
            let volume_cm3 = height * width * depth;
            // Aproximação de área de superfície para cálculo de material (simplificado)
            // Considera 6 faces para simplificar o cálculo de material total
            let surface_m2 = (volume_cm3 / 1000000) * 2;

            let pricePerCm2 = 0;
            switch (answers.material_principal) {
                case 'mdf': pricePerCm2 = rules.price_per_cm2_mdf; break;
                case 'compensado': pricePerCm2 = rules.price_per_cm2_compensado; break;
                case 'madeira_macica': pricePerCm2 = rules.price_per_cm2_madeira_macica; break;
                default: pricePerCm2 = rules.price_per_cm2_outros;
            }

            // Cálculo baseado no volume e preço por cm², ajustado com um multiplicador para ter valores mais realistas
            calculatedPrice = (volume_cm3 * pricePerCm2) * 10;
            explanation.push(`Base (${pricePerCm2.toFixed(3)}/cm³ * ${volume_cm3}cm³): R$ ${(volume_cm3 * pricePerCm2 * 10).toFixed(2)}`);

            if (answers.cor_acabamento) {
                calculatedPrice += rules.finishing_fee;
                explanation.push(`Taxa de acabamento/cor: R$ ${rules.finishing_fee.toFixed(2)}`);
            }
            // Adicionar custo de montagem simulado (ex: 2 horas)
            const assemblyCost = 2 * rules.assembly_fee_per_hour;
            calculatedPrice += assemblyCost;
            explanation.push(`Custo de montagem (simulado 2h): R$ ${assemblyCost.toFixed(2)}`);
            break;

        case 'marmoreiro':
             let area_m2_marble = parseFloat(answers.area_m2) || 0;
             let pricePerM2Marble = 0;
              switch (answers.material_escolhido) {
                case 'granito': pricePerM2Marble = rules.price_per_m2_granito; break;
                case 'marmore_branco': pricePerM2Marble = rules.price_per_m2_marmore_branco; break;
                case 'quartzito': pricePerM2Marble = rules.price_per_m2_quartzito; break;
                case 'superficie_quartzo': pricePerM2Marble = rules.price_per_m2_superficie_quartzo; break;
                default: pricePerM2Marble = rules.price_per_m2_outros;
            }
            calculatedPrice = area_m2_marble * pricePerM2Marble;
            explanation.push(`Material (${answers.material_escolhido}): R$ ${(area_m2_marble * pricePerM2Marble).toFixed(2)}`);

            calculatedPrice += area_m2_marble * rules.processing_fee_per_m2;
            explanation.push(`Processamento/Corte (R$ ${rules.processing_fee_per_m2.toFixed(2)}/m²): R$ ${(area_m2_marble * rules.processing_fee_per_m2).toFixed(2)}`);

             // Adiciona taxa de borda se especificada e for bancada
             if (answers.tipo_acabamento_borda && ['bancada_cozinha', 'bancada_banheiro'].includes(answers.tipo_superficie)) {
                  calculatedPrice += rules.edge_finishing_fee;
                  explanation.push(`Acabamento de borda: R$ ${rules.edge_finishing_fee.toFixed(2)}`);
             }

             // Adiciona taxa de instalação simulada
             const installationFee = rules.installation_fee_base + (area_m2_marble * rules.installation_fee_per_m2);
             calculatedPrice += installationFee;
             explanation.push(`Instalação (Base R$ ${rules.installation_fee_base} + R$ ${rules.installation_fee_per_m2}/m²): R$ ${installationFee.toFixed(2)}`);
            break;

        case 'pintor':
             let area_paint = parseFloat(answers.area_m2) || 0;
             let pricePerM2Paint = 0;
             const tipoAmbiente = answers.tipo_ambiente;

             if (tipoAmbiente === 'interno_res') pricePerM2Paint = rules.price_per_m2_interno_res;
             else if (tipoAmbiente === 'externo_res') pricePerM2Paint = rules.price_per_m2_externo_res;
             else if (tipoAmbiente === 'comercial_int') pricePerM2Paint = rules.price_per_m2_comercial_int;
             else if (tipoAmbiente === 'comercial_ext') pricePerM2Paint = rules.price_per_m2_comercial_ext;
             else if (tipoAmbiente === 'fachada') pricePerM2Paint = rules.price_per_m2_fachada;

             let paintCost = area_paint * pricePerM2Paint;
             explanation.push(`Base (${tipoAmbiente}): R$ ${(area_paint * pricePerM2Paint).toFixed(2)}`);

             const numDemos = parseInt(answers.quantidade_demãos) || 2;
             if (numDemos > 2) {
                 const extraCoatsCost = area_paint * rules.price_per_demao_extra * (numDemos - 2);
                 paintCost += extraCoatsCost;
                 explanation.push(`Demãos extras (${numDemos - 2}): R$ ${extraCoatsCost.toFixed(2)}`);
             }

             // Verifica se o tipo de pintura inclui "textura" para aplicar taxa adicional
             // Adiciona verificação para garantir que answers.tipo_pintura é uma string antes de chamar .toLowerCase()
             if (typeof answers.tipo_pintura === 'string' && answers.tipo_pintura.toLowerCase().includes('textura')) {
                 const textureCost = area_paint * rules.texture_fee_per_m2;
                 paintCost += textureCost;
                 explanation.push(`Textura (R$ ${rules.texture_fee_per_m2.toFixed(2)}/m²): R$ ${textureCost.toFixed(2)}`);
             }
             calculatedPrice = paintCost;
            break;

        default:
             // Fallback genérico ou erro
             displayBotMessage("Erro: Cálculo de preço não implementado para este serviço.");
             incrementMetric('errorsEncountered');
             return; // Sai da função se o serviço não for suportado
    }

    // Aplicar limites mínimo e máximo
    if (calculatedPrice < rules.min_price) {
        calculatedPrice = rules.min_price;
        explanation.push(`Preço ajustado para o mínimo de R$ ${rules.min_price.toFixed(2)}.`);
    } else if (calculatedPrice > rules.max_price) {
        calculatedPrice = rules.max_price;
        explanation.push(`Preço ajustado para o máximo de R$ ${rules.max_price.toFixed(2)}.`);
    }

    const finalPrice = parseFloat(calculatedPrice.toFixed(2));

    // Determinar faixa de preço (ex: +/- 15%)
    const rangeLower = finalPrice * 0.85;
    const rangeUpper = finalPrice * 1.15;

    const priceResult = {
        suggested: finalPrice,
        range: {
            min: parseFloat(rangeLower.toFixed(2)),
            max: parseFloat(rangeUpper.toFixed(2))
        },
        explanation: explanation.join(' | ')
    };

    console.log("Resultado do cálculo:", priceResult);
    displayPriceAndContinue(priceResult);
    incrementMetric('estimatesGiven');
    saveState();

    // Chama a simulação de imagem após o cálculo, com um pequeno delay para não sobrepor a mensagem de cálculo
    setTimeout(() => {
        generateImageSimulation();
    }, 500);
}

function displayPriceAndContinue(priceResult) {
    showLoadingIndicator(false); // Esconde o loading

    let message = `Com base nas suas respostas, o orçamento sugerido é:<br>
    <strong>R$ ${priceResult.suggested.toLocaleString('pt-BR')}</strong><br>
    <small>(Faixa estimada: R$ ${priceResult.range.min.toLocaleString('pt-BR')} a R$ ${priceResult.range.max.toLocaleString('pt-BR')})</small><br><br>
    <strong>Detalhes:</strong> ${priceResult.explanation}<br><br>
    <p class="text-warning">Lembre-se: Este é um orçamento simulado. O valor final pode variar após visita técnica e detalhamento do projeto.</p>`;

    displayBotMessage(message);

    // Apresentar opções: Salvar Lead, Nova Simulação, etc.
    const options = {
        suggestions: [
            { value: 'save_lead', label: 'Salvar Orçamento (Lead)' },
            { value: 'new_simulation', label: 'Nova Simulação' }
        ]
    };
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.id = 'input-suggestions';
    suggestionsDiv.classList.add('mt-2');
    options.suggestions.forEach(suggestion => {
        const btn = document.createElement('button');
        btn.classList.add('btn', 'btn-success', 'me-2'); // Botões de ação final
        btn.textContent = suggestion.label;
        btn.onclick = () => handleFinalActions(suggestion.value);
        suggestionsDiv.appendChild(btn);
    });

    // Adiciona os botões de ação após a mensagem de orçamento
    const lastBotMessage = document.querySelector('#chat-output .bot-message:last-child');
    if (lastBotMessage) {
        lastBotMessage.appendChild(suggestionsDiv);
    } else {
         // Caso não haja última mensagem (improvável), adiciona uma nova seção de opções
         displayBotMessage("O que deseja fazer agora?", options);
    }

     // Desabilita o input de texto e botão de enviar, pois as ações finais são por botões
     const userInput = document.getElementById('user-input');
     userInput.style.display = 'none'; // Esconde o input de texto
     const sendButton = document.getElementById('send-button');
     sendButton.style.display = 'none'; // Esconde o botão de enviar
}

function handleFinalActions(action) {
     clearErrorMessage();
     switch(action) {
         case 'save_lead':
             packageAndSaveLead();
             break;
         case 'new_simulation':
             resetChat();
             break;
     }
}

function resetChat() {
    // Reinicia o estado da conversa, mantendo leads e métricas
    conversationState = {
        currentService: null,
        currentQuestionIndex: 0,
        answers: {},
        leads: conversationState.leads, // Mantém leads existentes
        metrics: conversationState.metrics // Mantém métricas existentes
    };
    // Limpa a área de chat e exibe a tela inicial de seleção de serviço
    document.getElementById('chat-output').innerHTML = `
        <div class="message bot-message">
            <p>Olá! Por favor, selecione o tipo de serviço desejado:</p>
            <div id="service-selection" class="d-grid gap-2"></div>
        </div>`;
    document.getElementById('chat-input-area').style.display = 'none'; // Esconde a área de input
    setupServiceButtons(); // Reexibe os botões de serviço
    saveState(); // Salva o estado resetado
}


// --- SIMULAÇÃO DE GERAÇÃO DE IMAGEM ---

function generateImageSimulation() {
    const serviceKey = conversationState.currentService;
    const answers = conversationState.answers;
    let prompt = `Generate a visualization for a ${serviceKey} service.`;
    let imageUrl = null; // Placeholder para URL de imagem

    console.log("Gerando simulação de imagem para:", serviceKey, answers);

    // Exemplo de construção de prompt e URL simulada usando placeholder.com
    switch (serviceKey) {
        case 'pintor':
            prompt += ` Room type: ${answers.tipo_ambiente}. Walls area: ${answers.area_m2} m². Color: ${answers.cor_desejada}. Paint type: ${answers.tipo_pintura}.`;
            // Simula uma imagem genérica de pintura com a cor especificada
            // Usando parâmetros na URL do placeholder para definir cor de fundo e texto
            imageUrl = `https://via.placeholder.com/600x400.png?text=Pintura:+${encodeURIComponent(answers.cor_desejada || 'Branco')}+${encodeURIComponent(answers.tipo_pintura || '')}`;
            break;
        case 'marmoreiro':
             prompt += ` Surface: ${answers.tipo_superficie}. Stone: ${answers.material_escolhido}. Area: ${answers.area_m2} m². Edge: ${answers.tipo_acabamento_borda}.`;
            // Simula uma imagem de bancada com cor/material
             imageUrl = `https://via.placeholder.com/600x400.png?text=Marmore:${encodeURIComponent(answers.material_escolhido || 'Pedra')}+${encodeURIComponent(answers.cor_pedra || '')}`;
            break;
        case 'gesseiro':
            prompt += ` Area: ${answers.area_m2} m². Type: ${answers.tipo_gesso}. Decorative details: ${answers.detalhes_adicionais}. Color: ${answers.cor_gesso}.`;
            imageUrl = `https://via.placeholder.com/600x400.png?text=Gesso:+${encodeURIComponent(answers.tipo_gesso)}`;
            break;
         case 'marceneiro':
             const altura = answers.medidas_altura_cm || 'NA';
             const largura = answers.medidas_largura_cm || 'NA';
             const profundidade = answers.medidas_profundidade_cm || 'NA';
             const material = answers.material_principal || 'Madeira';
             prompt += ` Furniture type: ${answers.tipo_mobiliar}. Dimensions: ${altura}x${largura}x${profundidade} cm. Material: ${material}. Finish: ${answers.cor_acabamento}.`;
             imageUrl = `https://via.placeholder.com/600x400.png?text=Moveis:+${encodeURIComponent(material)}+${encodeURIComponent(answers.cor_acabamento || 'Acabamento')}`;
            break;
        default:
            prompt += " General service details.";
            imageUrl = "https://via.placeholder.com/600x400.png?text=Visualizacao+Generica";
            break;
    }

    console.log("Prompt para API de Imagem:", prompt);

    // Simula a resposta da API (pode falhar para testar o fallback)
    const apiSuccess = Math.random() > 0.1; // 90% de chance de sucesso
    const apiResponse = {
        success: apiSuccess,
        imageUrl: apiSuccess ? imageUrl : null,
        message: apiSuccess ? "Visualização gerada com sucesso." : "Falha ao gerar visualização (simulado)."
    };

    if (apiResponse.success && apiResponse.imageUrl) {
        // Exibir imagem ou simulação com CSS
        displayImageSimulation(apiResponse.imageUrl, answers);
    } else {
        displayBotMessage("Não foi possível gerar a visualização neste momento. Verifique as informações fornecidas ou tente novamente.");
        incrementMetric('errorsEncountered');
    }
}

function displayImageSimulation(imageUrl, answers) {
     const chatOutput = document.getElementById('chat-output');
     const imgDiv = document.createElement('div');
     imgDiv.classList.add('message', 'bot-message', 'text-center');

     let content = `<h4>Visualização Simulada</h4>`;

    // Lógica de sobreposição ou exibição condicional com base no serviço
    if (conversationState.currentService === 'pintor' && answers.cor_desejada) {
         // Cria um div com a cor de fundo para simular a pintura
         content += `
            <div class="simulated-visual" style="background-color: ${answers.cor_desejada}; color: ${getContrastColor(answers.cor_desejada)};">
                <p>Ambiente simulado com a cor ${answers.cor_desejada}.</p>
                ${answers.tipo_pintura ? `<p>Tipo: ${answers.tipo_pintura}</p>` : ''}
            </div>
         `;
    } else if (conversationState.currentService === 'marmoreiro' && answers.material_escolhido) {
         // Simula a textura/cor da pedra usando a imagem do placeholder
         content += `
            <div class="simulated-visual marble-visual">
                <div class="marble-texture" style="background-image: url(${imageUrl});"></div>
                <p>Visualização simulada de ${answers.material_escolhido}.</p>
                ${answers.tipo_acabamento_borda ? `<p>Acabamento da borda: ${answers.tipo_acabamento_borda}</p>` : ''}
            </div>
         `;
    }
    else {
        // Exibe a imagem genérica se não houver lógica específica
        content += `<img src="${imageUrl}" alt="Visualização Simulada" class="simulated-visual-img">`;
        if (answers.cor_desejada || answers.cor_gesso || answers.cor_acabamento) {
             const color = answers.cor_desejada || answers.cor_gesso || answers.cor_acabamento;
             content += `<p><small>Cor/Material escolhido: ${color}</small></p>`;
        }
    }

     imgDiv.innerHTML = content;
     chatOutput.appendChild(imgDiv);
     chatOutput.scrollTop = chatOutput.scrollHeight;
}

// Função auxiliar para determinar a cor do texto (preto ou branco) que melhor contrasta com a cor de fundo
function getContrastColor(hexcolor){
    if (!hexcolor || !hexcolor.startsWith('#')) return '#000000'; // Retorna preto se a cor for inválida ou não hexadecimal
    hexcolor = hexcolor.replace("#", "");
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    // Fórmula de luminosidade percebida (YIQ)
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
}


// --- FUNÇÕES DE CONTROLE DE MÉTRICAS ---
function incrementMetric(metricName) {
    if (conversationState.metrics && conversationState.metrics.hasOwnProperty(metricName)) {
        conversationState.metrics[metricName]++;
        saveState(); // Salva ao incrementar métrica
        updateMetricsDashboard(); // Atualiza o dashboard se ele estiver visível
    }
}

// --- FUNÇÕES DE INICIALIZAÇÃO ---
// Listener principal para inicialização após o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
    loadState(); // Carrega o estado do localStorage
    loadConfig(); // Carrega a configuração dos serviços e renderiza os botões iniciais

    // Cria e adiciona o botão para alternar a visibilidade dos dashboards
    const container = document.querySelector('.container');
    if (container) {
        const toggleButton = document.createElement('button');
        toggleButton.classList.add('btn', 'btn-outline-info', 'mt-3', 'mb-3'); // Estilos para o botão
        toggleButton.textContent = 'Ver/Ocultar Leads e Métricas';
        toggleButton.onclick = toggleLeadDashboard; // Define a função a ser chamada ao clicar

        // Insere o botão antes do footer, se o footer existir
        const footer = container.querySelector('footer');
        if (footer) {
            container.insertBefore(toggleButton, footer);
        } else {
            container.appendChild(toggleButton); // Adiciona ao final se não houver footer
        }
    }

     // Inicializa a exibição dos dashboards se já houver dados salvos
     if(conversationState.leads && conversationState.leads.length > 0) {
         displayLeadDashboard();
     }
     updateMetricsDashboard(); // Atualiza as métricas mesmo que não haja leads
});

// Adiciona listener para o botão de enviar na área de input
document.getElementById('send-button').addEventListener('click', handleUserResponseWrapper);

// Permite o envio da resposta pressionando a tecla Enter no campo de input
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        handleUserResponseWrapper();
    }
});

// --- EXEMPLO DE DIÁLOGO COMPLETO (COMENTADO) ---
/*
Cenário: Usuário simula um serviço de Pintor.

1.  **Usuário:** Abre a página.
    **Bot:** Olá! Por favor, selecione o tipo de serviço desejado:
        [Gesseiro] [Marceneiro] [Marmoreiro] [Pintor]

2.  **Usuário:** Clica em `[Pintor]`.
    **Bot:** Qual o tipo de ambiente a ser pintado?
        [Residencial (Interno)] [Residencial (Externo)] [Comercial (Interno)] [Comercial (Externo)] [Fachada]

3.  **Usuário:** Clica em `[Residencial (Interno)]`.
    **Bot:** Qual a área total em metros quadrados (m²) a ser pintada (paredes e teto)?

4.  **Usuário:** Digita `100` e pressiona Enter/clica em Enviar.
    **Bot:** (Valida `100` m²)
        *Exibe:* `Você: 100 m²`
        Quantas demãos de tinta são necessárias? (Padrão: 2)

5.  **Usuário:** Digita `3` e pressiona Enter/clica em Enviar.
    **Bot:** (Valida 3 demãos)
        *Exibe:* `Você: 3 demãos`
        Qual a cor principal desejada?

6.  **Usuário:** Digita `#00FF00` (Verde Lima) e pressiona Enter/clica em Enviar.
    **Bot:** (Valida cor)
        *Exibe:* `Você: <span style="background-color:#00FF00; width:15px; height:15px;"></span> #00FF00`
        Qual o tipo de pintura (ex: acrílica, esmalte, textura)?

7.  **Usuário:** Digita `Acrílica fosca` e pressiona Enter/clica em Enviar.
    **Bot:** (Valida texto)
        *Exibe:* `Você: Acrílica fosca`
        Ótimo! Chegamos ao final das perguntas. Calculando seu orçamento...
        (Exibe indicador de loading)

8.  **Bot:** (Após cálculo e simulação de imagem)
        Com base nas suas respostas, o orçamento sugerido é:
        <strong>R$ 2.825,00</strong>
        <small>(Faixa estimada: R$ 2.390,63 a R$ 3.248,75)</small><br><br>
        <strong>Detalhes:</strong> Base (Residencial (Interno)): R$ 2.500,00 | Demãos extras (1): R$ 250,00 | Textura (R$ 15,00/m²): R$ 750,00
        <br><br>
        <p class="text-warning">Lembre-se: Este é um orçamento simulado...</p>
        (Exibe a visualização simulada com fundo verde)
        [Salvar Orçamento (Lead)] [Nova Simulação]

9.  **Usuário:** Clica em `[Salvar Orçamento (Lead)]`.
    **Bot:** (Salva o lead no localStorage)
        Orçamento para Pintor salvo com sucesso como lead! ID: [ID_GERADO].
        (Painel de Leads é atualizado, exibindo o novo lead)
        [Nova Simulação]

10. **Usuário:** Clica em `[Nova Simulação]`.
    **Bot:** (Reseta o chat)
        Olá! Por favor, selecione o tipo de serviço desejado:
        [Gesseiro] [Marceneiro] [Marmoreiro] [Pintor]
*/

// --- FUNÇÕES DE EMPACOTAMENTO DE LEAD (ETAPA 3) ---

function packageAndSaveLead() {
    // Verifica se há serviço e respostas para salvar
    if (!conversationState.currentService || Object.keys(conversationState.answers).length === 0) {
        displayBotMessage("Nenhum serviço ou resposta selecionado para salvar.");
        return;
    }

    const serviceKey = conversationState.currentService;
    const serviceDisplayName = serviceConfig.services[serviceKey].displayName;
    const config = serviceConfig.services[serviceKey];

    // Recalcula o preço final para garantir que os dados salvos estejam corretos
    let finalPrice = 0;
    let priceExplanation = '';
    let priceRange = { min: 0, max: 0 };

    try {
         // Usa a função interna de cálculo para obter os detalhes do preço
         const priceResult = computePriceForLead();
         if (priceResult) {
             finalPrice = priceResult.suggested;
             priceExplanation = priceResult.explanation;
             priceRange = priceResult.range;
         } else {
             throw new Error("Cálculo falhou.");
         }
     } catch (e) {
         console.error("Erro ao calcular preço para o lead:", e);
         displayBotMessage("Erro ao preparar o lead. Não foi possível calcular o preço final.");
         incrementMetric('errorsEncountered');
         return;
     }

    // Cria o objeto do lead
    const lead = {
        id: Date.now() + Math.random().toString(36).substring(2, 9), // ID único baseado em timestamp e string aleatória
        timestamp: new Date().toISOString(), // Data e hora da criação do lead
        service: serviceDisplayName, // Nome do serviço selecionado
        serviceKey: serviceKey, // Chave do serviço
        details: { ...conversationState.answers }, // Todas as respostas do usuário
        estimatedPrice: finalPrice, // Preço sugerido final
        priceRange: priceRange, // Faixa de preço
        priceExplanation: priceExplanation, // Detalhes do cálculo
        photoUrl: null, // Placeholder para URL da foto (futura implementação)
        visualizationUrl: null // Placeholder para URL da visualização (futura implementação)
    };

    // Adiciona o novo lead ao array de leads no estado
    conversationState.leads.push(lead);
    saveState(); // Salva o estado atualizado no localStorage

    // Feedback para o usuário
    displayBotMessage(`Orçamento para ${serviceDisplayName} salvo com sucesso como lead! ID: ${lead.id}.`);
    displayLeadDashboard(); // Atualiza o dashboard para mostrar o novo lead
    incrementMetric('leadsSaved'); // Incrementa a métrica de leads salvos

    // Limpa o estado da conversa atual para permitir uma nova simulação
    resetChat();

    // Atualiza o placeholder do input para indicar que o lead foi salvo e sugerir próxima ação
     const userInput = document.getElementById('user-input');
     userInput.style.display = 'block'; // Reexibe o input, mas o desabilita
     userInput.value = '';
     userInput.placeholder = "Lead salvo. Escolha uma nova simulação ou gerencie leads.";
     userInput.disabled = true; // Desabilita digitação direta

     // Atualiza o botão de enviar para não ter funcionalidade ativa
     const sendButton = document.getElementById('send-button');
     sendButton.onclick = () => {}; // Remove o listener anterior
     sendButton.disabled = true; // Desabilita o botão
}

// Função auxiliar para recalcular o preço sem interagir com a UI, usada ao salvar o lead
function computePriceForLead() {
     const serviceKey = conversationState.currentService;
     const config = serviceConfig.services[serviceKey];
     const answers = conversationState.answers;
     const rules = config.pricing_rules;
     let calculatedPrice = 0;
     let explanation = [];

     if (!config || !rules) return null; // Retorna null se a configuração não for encontrada

      // Reutiliza a mesma lógica de cálculo interna presente na função computePrice
     switch (serviceKey) {
         case 'gesseiro':
             let area = parseFloat(answers.area_m2) || 0;
             let pricePerM2 = rules.base_price_per_m2;
             if (answers.tipo_gesso === 'acartonado') pricePerM2 *= rules.drywall_multiplier;
             calculatedPrice = area * pricePerM2;
             if (answers.detalhes_adicionais) {
                 calculatedPrice += rules.decoration_sanca_fee;
                 explanation.push(`Detalhes/Sancas: +R$ ${rules.decoration_sanca_fee.toFixed(2)}`);
             }
             if (answers.cor_gesso && answers.cor_gesso !== config.questions.find(q => q.id === 'cor_gesso').defaultValue) {
                 calculatedPrice += area * rules.color_fee_per_m2;
                 explanation.push(`Pintura/Cor: +R$ ${(area * rules.color_fee_per_m2).toFixed(2)}`);
             }
             explanation.push(`Base (${pricePerM2.toFixed(2)}/m²): R$ ${(area * pricePerM2).toFixed(2)}`);
             calculatedPrice *= rules.material_multiplier;
             explanation.push(`Material (${(rules.material_multiplier - 1) * 100}%): +R$ ${(calculatedPrice / rules.material_multiplier * (rules.material_multiplier - 1)).toFixed(2)}`);
             break;

         case 'marceneiro':
             let height = parseFloat(answers.medidas_altura_cm) || 0;
             let width = parseFloat(answers.medidas_largura_cm) || 0;
             let depth = parseFloat(answers.medidas_profundidade_cm) || 0;
             let volume_cm3 = height * width * depth;
             let surface_m2 = (volume_cm3 / 1000000) * 2; // Simples aproximação
             let pricePerCm2 = rules[`price_per_cm2_${answers.material_principal}`] || rules.price_per_cm2_outros;
             calculatedPrice = (volume_cm3 * pricePerCm2) * 10; // Ajuste
             explanation.push(`Base (${pricePerCm2.toFixed(3)}/cm³ * ${volume_cm3}cm³): R$ ${(volume_cm3 * pricePerCm2 * 10).toFixed(2)}`);
             if (answers.cor_acabamento) {
                 calculatedPrice += rules.finishing_fee;
                 explanation.push(`Acabamento: +R$ ${rules.finishing_fee.toFixed(2)}`);
             }
             const assemblyCost = 2 * rules.assembly_fee_per_hour; // Simulado
             calculatedPrice += assemblyCost;
             explanation.push(`Montagem (2h): +R$ ${assemblyCost.toFixed(2)}`);
             break;

         case 'marmoreiro':
             let area_m2_marble = parseFloat(answers.area_m2) || 0;
             let pricePerM2Marble = rules[`price_per_m2_${answers.material_escolhido}`] || rules.price_per_m2_outros;
             calculatedPrice = area_m2_marble * pricePerM2Marble;
             explanation.push(`Material (${answers.material_escolhido}): R$ ${(area_m2_marble * pricePerM2Marble).toFixed(2)}`);
             calculatedPrice += area_m2_marble * rules.processing_fee_per_m2;
             explanation.push(`Processamento (${rules.processing_fee_per_m2.toFixed(2)}/m²): +R$ ${(area_m2_marble * rules.processing_fee_per_m2).toFixed(2)}`);
             if (answers.tipo_acabamento_borda && ['bancada_cozinha', 'bancada_banheiro'].includes(answers.tipo_superficie)) {
                 calculatedPrice += rules.edge_finishing_fee;
                 explanation.push(`Acabamento Borda: +R$ ${rules.edge_finishing_fee.toFixed(2)}`);
             }
             const installationFee = rules.installation_fee_base + (area_m2_marble * rules.installation_fee_per_m2);
             calculatedPrice += installationFee;
             explanation.push(`Instalação: +R$ ${installationFee.toFixed(2)}`);
             break;

         case 'pintor':
             let area_paint = parseFloat(answers.area_m2) || 0;
             let pricePerM2Paint = rules[`price_per_m2_${answers.tipo_ambiente}`] || 0;
             let paintCost = area_paint * pricePerM2Paint;
             explanation.push(`Base (${answers.tipo_ambiente}): R$ ${(area_paint * pricePerM2Paint).toFixed(2)}`);
             const numDemos = parseInt(answers.quantidade_demãos) || 2;
             if (numDemos > 2) {
                 const extraCoatsCost = area_paint * rules.price_per_demao_extra * (numDemos - 2);
                 paintCost += extraCoatsCost;
                 explanation.push(`Demãos extras (${numDemos - 2}): +R$ ${extraCoatsCost.toFixed(2)}`);
             }
             if (typeof answers.tipo_pintura === 'string' && answers.tipo_pintura.toLowerCase().includes('textura')) {
                 const textureCost = area_paint * rules.texture_fee_per_m2;
                 paintCost += textureCost;
                 explanation.push(`Textura (${rules.texture_fee_per_m2.toFixed(2)}/m²): +R$ ${textureCost.toFixed(2)}`);
             }
             calculatedPrice = paintCost;
             break;

         default: return null;
     }

     // Aplicar limites
     if (calculatedPrice < rules.min_price) calculatedPrice = rules.min_price;
     if (calculatedPrice > rules.max_price) calculatedPrice = rules.max_price;

     const finalPriceCalc = parseFloat(calculatedPrice.toFixed(2));
     const rangeLower = finalPriceCalc * 0.85;
     const rangeUpper = finalPriceCalc * 1.15;

     return {
         suggested: finalPriceCalc,
         range: {
             min: parseFloat(rangeLower.toFixed(2)),
             max: parseFloat(rangeUpper.toFixed(2))
         },
         explanation: explanation.join(' | ')
     };
}


// --- EXPORTAÇÃO DE LEAD (SIMULADA) ---

function exportLeadAsJson() {
    const leads = conversationState.leads;
    if (!leads || leads.length === 0) {
        alert("Nenhum lead para exportar.");
        return;
    }

    // Cria um link de download para o arquivo JSON
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "leads.json");
    document.body.appendChild(downloadAnchorNode); // Adiciona temporariamente ao DOM para simular o clique
    downloadAnchorNode.click();
    downloadAnchorNode.remove(); // Remove do DOM
    alert("Leads exportados como leads.json");
}

// Simulação de exportação para PDF (usando uma lib via CDN na próxima etapa)
function exportLeadAsPdf() {
     alert("A exportação para PDF será implementada na próxima etapa usando uma biblioteca como jsPDF via CDN.");
     // Placeholder para a implementação futura com jsPDF:
      /*
      const leads = conversationState.leads;
      if (!leads || leads.length === 0) { alert("Nenhum lead para exportar."); return; }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; // CDN jsPDF
      script.onload = () => {
         const { jsPDF } = window.jspdf;
         const doc = new jsPDF();
         // Lógica para formatar e adicionar leads ao PDF
         doc.text("Lista de Leads", 10, 10);
         let y = 20;
         leads.forEach((lead, index) => {
            if (y > 280) { // Nova página se necessário
                doc.addPage();
                y = 10;
            }
             doc.text(`Lead ${index + 1}: ID ${lead.id} - ${lead.service} - R$ ${lead.estimatedPrice}`, 10, y);
             y += 10;
         });
         doc.save('leads.pdf');
      };
      document.body.appendChild(script);
      */
}


// --- PAINEL DE LEADS E MÉTRICAS (DINÂMICO) ---

function displayLeadDashboard() {
    const mainContainer = document.querySelector('.container'); // Pega o container principal

    // Verifica se o dashboard já existe para evitar duplicação
    let dashboardDiv = document.getElementById('lead-dashboard');
    if (!dashboardDiv) {
        dashboardDiv = document.createElement('div');
        dashboardDiv.id = 'lead-dashboard';
        mainContainer.appendChild(dashboardDiv); // Adiciona ao final do container principal
    }

    let dashboardContent = `<h2>Meus Leads Salvos</h2>`;
    if (conversationState.leads && conversationState.leads.length > 0) {
        // Ordena os leads por data (mais recentes primeiro)
        const sortedLeads = [...conversationState.leads].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        sortedLeads.forEach(lead => {
            dashboardContent += `
                <div class="lead-item">
                    <h5>Lead #${lead.id.substring(0, 8)} (${lead.service})</h5>
                    <p><small>Data: ${new Date(lead.timestamp).toLocaleString('pt-BR')}</small></p>
                    <p>Orçamento: R$ ${lead.estimatedPrice.toLocaleString('pt-BR')} (Faixa: ${lead.range.min.toLocaleString('pt-BR')} - ${lead.range.max.toLocaleString('pt-BR')})</p>
                    <div class="lead-actions">
                        <button class="btn btn-info btn-sm" onclick="viewLeadDetails('${lead.id}')">Detalhes</button>
                        <button class="btn btn-secondary btn-sm" onclick="deleteLead('${lead.id}')">Excluir</button>
                    </div>
                </div>
            `;
        });
        // Botões de exportação abaixo da lista de leads
        dashboardContent += `
            <div class="text-center mt-3">
                <button class="btn btn-primary me-2" onclick="exportLeadAsJson()">Exportar JSON</button>
                <button class="btn btn-secondary" onclick="exportLeadAsPdf()">Exportar PDF (Simulado)</button>
            </div>
        `;
    } else {
        dashboardContent += '<p>Nenhum lead salvo ainda.</p>';
    }
    dashboardDiv.innerHTML = dashboardContent;
}

// Abre um alerta com os detalhes do lead selecionado
function viewLeadDetails(leadId) {
    const lead = conversationState.leads.find(l => l.id === leadId);
    if (lead) {
        // Formata os detalhes para exibição
        let detailsString = `Serviço: ${lead.service}\nData: ${new Date(lead.timestamp).toLocaleString('pt-BR')}\nOrçamento: R$ ${lead.estimatedPrice.toLocaleString('pt-BR')}\nFaixa: R$ ${lead.range.min.toLocaleString('pt-BR')} - R$ ${lead.range.max.toLocaleString('pt-BR')}\nExplicação: ${lead.priceExplanation}\n\nRespostas:\n`;
        for (const key in lead.details) {
            detailsString += `- ${key}: ${lead.details[key]}\n`;
        }
        alert(detailsString);
    }
}

// Remove um lead do array e atualiza o dashboard
function deleteLead(leadId) {
    if (confirm("Tem certeza que deseja excluir este lead?")) {
        conversationState.leads = conversationState.leads.filter(l => l.id !== leadId);
        saveState(); // Salva o estado sem o lead excluído
        displayLeadDashboard(); // Atualiza a exibição do dashboard
    }
}

// Atualiza a exibição do dashboard de métricas
function updateMetricsDashboard() {
    let metricsDiv = document.getElementById('metrics-dashboard');
    const mainContainer = document.querySelector('.container');

    // Cria o dashboard de métricas se ele ainda não existir
    if (!metricsDiv) {
        metricsDiv = document.createElement('div');
        metricsDiv.id = 'metrics-dashboard';
        // Tenta inserir o dashboard de métricas antes do dashboard de leads, se ambos existirem
        const leadsDashboard = document.getElementById('lead-dashboard');
        if (leadsDashboard) {
             mainContainer.insertBefore(metricsDiv, leadsDashboard);
        } else {
             mainContainer.appendChild(metricsDiv); // Adiciona ao final se não houver dashboard de leads
        }
    }

    let metricsContent = `<h2>Métricas de Uso</h2>`;
    const metrics = conversationState.metrics || { estimatesGiven: 0, leadsSaved: 0, errorsEncountered: 0 }; // Valores padrão

    // Exibe as métricas formatadas
    metricsContent += `
        <div class="metric-item">
            <span>Estimativas Geradas:</span>
            <span>${metrics.estimatesGiven}</span>
        </div>
        <div class="metric-item">
            <span>Leads Salvos:</span>
            <span>${metrics.leadsSaved}</span>
        </div>
        <div class="metric-item">
            <span>Erros/Alertas:</span>
            <span>${metrics.errorsEncountered}</span>
        </div>
    `;
    metricsDiv.innerHTML = metricsContent;
}

// Controla a visibilidade do dashboard de leads e métricas
function toggleLeadDashboard() {
    const dashboard = document.getElementById('lead-dashboard');
    const metricsDashboard = document.getElementById('metrics-dashboard');

    let anyDashboardVisible = false;

    if (dashboard) {
        if (dashboard.style.display === 'none' || dashboard.style.display === '') {
            dashboard.style.display = 'block';
            anyDashboardVisible = true;
        } else {
            dashboard.style.display = 'none';
        }
    }
    if (metricsDashboard) {
        if (metricsDashboard.style.display === 'none' || metricsDashboard.style.display === '') {
            metricsDashboard.style.display = 'block';
            anyDashboardVisible = true;
        } else {
            metricsDashboard.style.display = 'none';
        }
    }

    // Se nenhum dashboard existia e foi criado, garante que sejam visíveis
    if (!dashboard && !metricsDashboard && anyDashboardVisible) {
         displayLeadDashboard();
         updateMetricsDashboard();
    }
}

// --- EVENT LISTENERS ADICIONAIS ---
// Listener principal para inicialização após o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
    loadState(); // Carrega o estado do localStorage
    loadConfig(); // Carrega a configuração dos serviços e renderiza os botões iniciais

    // Cria e adiciona o botão para alternar a visibilidade dos dashboards
    const container = document.querySelector('.container');
    if (container) {
        const toggleButton = document.createElement('button');
        toggleButton.classList.add('btn', 'btn-outline-info', 'mt-3', 'mb-3'); // Estilos para o botão
        toggleButton.textContent = 'Ver/Ocultar Leads e Métricas';
        toggleButton.onclick = toggleLeadDashboard; // Define a função a ser chamada ao clicar

        // Insere o botão antes do footer, se o footer existir
        const footer = container.querySelector('footer');
        if (footer) {
            container.insertBefore(toggleButton, footer);
        } else {
            container.appendChild(toggleButton); // Adiciona ao final se não houver footer
        }
    }

     // Inicializa a exibição dos dashboards se já houver dados salvos
     if(conversationState.leads && conversationState.leads.length > 0) {
         displayLeadDashboard();
     }
     updateMetricsDashboard(); // Atualiza as métricas mesmo que não haja leads
});

// Adiciona listener para o botão de enviar na área de input
document.getElementById('send-button').addEventListener('click', handleUserResponseWrapper);

// Permite o envio da resposta pressionando a tecla Enter no campo de input
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        handleUserResponseWrapper();
    }
});
