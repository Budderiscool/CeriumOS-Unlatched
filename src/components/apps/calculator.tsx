
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function CalculatorApp() {
    const [display, setDisplay] = useState('0');
    const [currentValue, setCurrentValue] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(true);

    const inputDigit = (digit: string) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };
    
    const inputDecimal = () => {
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
        } else if (display.indexOf('.') === -1) {
            setDisplay(display + '.');
        }
    };

    const clearDisplay = () => {
        setDisplay('0');
        setCurrentValue(null);
        setOperator(null);
        setWaitingForOperand(true);
    };

    const performOperation = (nextOperator: string) => {
        const inputValue = parseFloat(display);

        if (currentValue === null) {
            setCurrentValue(inputValue);
        } else if (operator) {
            const result = calculate(currentValue, inputValue, operator);
            setCurrentValue(result);
            setDisplay(String(result));
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    };
    
    const calculate = (firstOperand: number, secondOperand: number, operator: string) => {
        switch (operator) {
            case '+': return firstOperand + secondOperand;
            case '-': return firstOperand - secondOperand;
            case '*': return firstOperand * secondOperand;
            case '/': return firstOperand / secondOperand;
            case '=': return secondOperand;
            default: return secondOperand;
        }
    }

    const handleEquals = () => {
        const inputValue = parseFloat(display);
        if (operator && currentValue !== null) {
            const result = calculate(currentValue, inputValue, operator);
            setCurrentValue(result);
            setDisplay(String(result));
            setOperator(null); 
        }
    };

    const buttons = [
        { label: 'AC', handler: clearDisplay, className: "col-span-2 bg-muted hover:bg-muted/80 text-foreground" },
        { label: 'C', handler: clearDisplay, className: "bg-muted hover:bg-muted/80 text-foreground" },
        { label: '/', handler: () => performOperation('/'), className: "bg-primary hover:bg-primary/90" },
        { label: '7', handler: () => inputDigit('7') },
        { label: '8', handler: () => inputDigit('8') },
        { label: '9', handler: () => inputDigit('9') },
        { label: '*', handler: () => performOperation('*'), className: "bg-primary hover:bg-primary/90" },
        { label: '4', handler: () => inputDigit('4') },
        { label: '5', handler: () => inputDigit('5') },
        { label: '6', handler: () => inputDigit('6') },
        { label: '-', handler: () => performOperation('-'), className: "bg-primary hover:bg-primary/90" },
        { label: '1', handler: () => inputDigit('1') },
        { label: '2', handler: () => inputDigit('2') },
        { label: '3', handler: () => inputDigit('3') },
        { label: '+', handler: () => performOperation('+'), className: "bg-primary hover:bg-primary/90" },
        { label: '0', handler: () => inputDigit('0'), className: "col-span-2" },
        { label: '.', handler: inputDecimal },
        { label: '=', handler: handleEquals, className: "bg-primary hover:bg-primary/90" },
    ];

    return (
        <div className="w-full h-full flex flex-col bg-background p-4 justify-between">
            <div className="bg-secondary/50 rounded-lg p-4 text-right mb-4">
                <p className="text-4xl font-mono text-foreground break-all">{display}</p>
            </div>
            <div className="grid grid-cols-4 gap-2 flex-grow">
                {buttons.map(({ label, handler, className }) => (
                    <Button key={label} onClick={handler} className={`h-full text-xl ${className || 'bg-secondary hover:bg-secondary/80'}`}>
                        {label}
                    </Button>
                ))}
            </div>
        </div>
    );
}

