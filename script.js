const calculate = (n1, operator, n2) => {
  const firstNum = parseFloat(n1)
  const secondNum = parseFloat(n2)
  if (operator === 'add') return firstNum + secondNum
  if (operator === 'subtract') return firstNum - secondNum
  if (operator === 'multiply') return firstNum * secondNum
  if (operator === 'divide') return firstNum / secondNum
}

const getKeyType = (key) => {
  const { action } = key.dataset
  if (!action) return 'number'
  if (
    action === 'add' ||
    action === 'subtract' ||
    action === 'multiply' ||
    action === 'divide'
  ) return 'operator'
  if (action === 'memory-clear' || action === 'memory-recall' || action === 'memory-add' || action === 'memory-subtract') return 'memory'
  if (action === 'delete') return 'delete'
  return action
}

const createResultString = (key, displayedNum, state) => {
  const keyContent = key.textContent
  const { action } = key.dataset
  const {
    firstValue,
    modValue,
    operator,
    previousKeyType
  } = state
  const keyType = getKeyType(key)

  if (keyType === 'number') {
    return displayedNum === '0' ||
      previousKeyType === 'operator' ||
      previousKeyType === 'calculate'
      ? keyContent
      : displayedNum + keyContent
  }

  if (keyType === 'decimal') {
    if (!displayedNum.includes('.')) return displayedNum + '.'
    if (previousKeyType === 'operator' || previousKeyType === 'calculate') return '0.'
    return displayedNum
  }

  if (
    action === 'add' ||
    action === 'subtract' ||
    action === 'multiply' ||
    action === 'divide'
  ) {
    return firstValue &&
      operator &&
      previousKeyType !== 'operator' &&
      previousKeyType !== 'calculate'
      ? calculate(firstValue, operator, displayedNum)
      : displayedNum
  }

  if (keyType === 'delete') {
    if (displayedNum.length > 1) {
      return displayedNum.slice(0, -1)
    }
    return '0'
  }

  if (keyType === 'clear') return '0'

  if (keyType === 'calculate') {
    const modValueData = state.modValue
    return firstValue
      ? previousKeyType === 'calculate'
        ? calculate(displayedNum, operator, modValueData)
        : calculate(firstValue, operator, displayedNum)
      : displayedNum
  }

  if (keyType === 'memory') {
    if (action === 'memory-clear') return displayedNum
    if (action === 'memory-recall') return state.memory || '0'
    if (action === 'memory-add' || action === 'memory-subtract') return displayedNum
  }

  return displayedNum
}

const updateCalculatorState = (key, calculator, calculatedValue, displayedNum) => {
  const keyType = getKeyType(key)
  const { action } = key.dataset
  const {
    firstValue,
    modValue,
    operator,
    previousKeyType,
    memory = '0'
  } = calculator.dataset

  calculator.dataset.previousKeyType = keyType

  if (keyType === 'number') {
    calculator.dataset.previousKeyType = 'number'
  }

  if (keyType === 'decimal') {
    calculator.dataset.previousKeyType = 'decimal'
  }

  if (keyType === 'delete') {
    calculator.dataset.previousKeyType = 'delete'
  }

  if (
    action === 'add' ||
    action === 'subtract' ||
    action === 'multiply' ||
    action === 'divide'
  ) {
    if (
      firstValue &&
      operator &&
      previousKeyType !== 'operator' &&
      previousKeyType !== 'calculate'
    ) {
      calculator.dataset.firstValue = calculatedValue
    } else {
      calculator.dataset.firstValue = displayedNum
    }

    calculator.dataset.previousKeyType = 'operator'
    calculator.dataset.operator = action
  }

  if (keyType === 'clear') {
    calculator.dataset.firstValue = ''
    calculator.dataset.modValue = ''
    calculator.dataset.operator = ''
    calculator.dataset.previousKeyType = 'clear'
  }

  if (keyType === 'calculate') {
    calculator.dataset.modValue = firstValue && previousKeyType === 'calculate'
      ? modValue
      : displayedNum

    calculator.dataset.previousKeyType = 'calculate'
  }

  if (keyType === 'memory') {
    const currentNum = parseFloat(displayedNum || '0')
    const memoryValue = parseFloat(memory || '0')
    
    if (action === 'memory-clear') {
      calculator.dataset.memory = '0'
    } else if (action === 'memory-add') {
      calculator.dataset.memory = (memoryValue + currentNum).toString()
    } else if (action === 'memory-subtract') {
      calculator.dataset.memory = (memoryValue - currentNum).toString()
    }
    
    calculator.dataset.previousKeyType = 'memory'
  }
}

const updateVisualState = (key, calculator) => {
  const keyType = getKeyType(key)
  Array.from(key.parentNode.children).forEach(k => k.classList.remove('is-depressed'))

  if (keyType === 'operator') key.classList.add('is-depressed')
}

// Основной код
const calculator = document.querySelector('.calculator')
const keys = calculator.querySelector('.calculator__keys')
const display = calculator.querySelector('.calculator__display')

// Инициализация памяти
calculator.dataset.memory = '0'

keys.addEventListener('click', e => {
  if (!e.target.matches('button')) return

  const key = e.target
  const displayedNum = display.textContent
  const resultString = createResultString(key, displayedNum, calculator.dataset)

  display.textContent = resultString
  updateCalculatorState(key, calculator, resultString, displayedNum)
  updateVisualState(key, calculator)
})