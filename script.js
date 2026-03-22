const display = document.getElementById('display');
let currentInput = '0';
let shouldResetDisplay = false;


function safeEvaluate(expression) {
    try {
        expression = expression.replace(/\s/g, '');
        expression = expression.replace(/×/g, '*');
        
        if (!expression || expression === '.') return '0';
        
        const tokens = tokenize(expression);
        if (!tokens.length) return '0';
        
        return evaluateTokens(tokens).toString();
    } catch (error) {
        console.error('Ошибка вычисления:', error);
        return 'Ошибка';
    }
}

function tokenize(expression) {
    const tokens = [];
    let i = 0;
    
    while (i < expression.length) {
        const char = expression[i];
        
        if ((char >= '0' && char <= '9') || char === '.') {
            let number = '';
            while (i < expression.length && 
                   ((expression[i] >= '0' && expression[i] <= '9') || expression[i] === '.')) {
                number += expression[i];
                i++;
            }
            if ((number.match(/\./g) || []).length <= 1) {
                tokens.push({ type: 'number', value: parseFloat(number) });
            }
            continue;
        }
        
        if (['+', '-', '*', '/'].includes(char)) {
            tokens.push({ type: 'operator', value: char });
            i++;
            continue;
        }
        
        throw new Error(`Неизвестный символ: ${char}`);
    }
    
    return tokens;
}

function evaluateTokens(tokens) {
    tokens = handleMultiplicationDivision(tokens);
    return handleAdditionSubtraction(tokens);
}

function handleMultiplicationDivision(tokens) {
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'operator' && (tokens[i].value === '*' || tokens[i].value === '/')) {
            const left = tokens[i - 1].value;
            const operator = tokens[i].value;
            const right = tokens[i + 1].value;
            
            let result;
            if (operator === '*') {
                result = left * right;
            } else {
                if (right === 0) throw new Error('Деление на ноль');
                result = left / right;
            }
            
            tokens.splice(i - 1, 3, { type: 'number', value: result });
            i = Math.max(-1, i - 2);
        }
    }
    return tokens;
}

function handleAdditionSubtraction(tokens) {
    let result = tokens[0].value;
    
    for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i].value;
        const right = tokens[i + 1].value;
        
        if (operator === '+') {
            result += right;
        } else {
            result -= right;
        }
    }
    
    return result;
}

function appendToDisplay(value) {
    if (shouldResetDisplay) {
        currentInput = '0';
        shouldResetDisplay = false;
    }

    if (currentInput === '0' && value !== '.') {
        currentInput = value;
    } else {
        currentInput += value;
    }

    display.value = currentInput;
}

function clearDisplay() {
    currentInput = '0';
    shouldResetDisplay = false;
    display.value = currentInput;
}

function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    display.value = currentInput;
}

function calculate() {
    const result = safeEvaluate(currentInput);
    display.value = result;
    currentInput = result;
    shouldResetDisplay = true;
}

// Обработка клавиатуры
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    if (key >= '0' && key <= '9' || key === '.') {
        event.preventDefault();
        appendToDisplay(key);
    } else if (key === '+' || key === '-') {
        event.preventDefault();
        appendToDisplay(key);
    } else if (key === '*') {
        event.preventDefault();
        appendToDisplay('*');
    } else if (key === '/') {
        event.preventDefault();
        appendToDisplay('/');
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        event.preventDefault();
        clearDisplay();
    } else if (key === 'Backspace') {
        event.preventDefault();
        deleteLast();
    }
});

// Инициализация
display.value = currentInput;