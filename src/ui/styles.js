export const styles = `
.solver-ui {
    position: fixed;
    top: 50%;
    left: 50%;
    margin-left: -150px;
    margin-top: -150px;
    background: #1a1a1a;
    color: #fff;
    padding: 20px;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    z-index: 10000;
    min-width: 300px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: none;
    user-select: none;
}

.solver-ui.visible {
    display: block;
}

.solver-ui h2 {
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #fff;
    border-bottom: 2px solid #333;
    padding-bottom: 8px;
    cursor: move;
}

.solver-ui .setting-row {
    margin: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.solver-ui label {
    margin-right: 10px;
    font-size: 14px;
}

.solver-ui input[type="number"] {
    width: 80px;
    padding: 4px;
    border: 1px solid #333;
    background: #2a2a2a;
    color: #fff;
    border-radius: 4px;
}

.solver-ui input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #4CAF50;
}

.solver-ui input[type="color"] {
    width: 40px;
    height: 25px;
    padding: 0 2px;
    border: none;
    border-radius: 4px;
    background: #2a2a2a;
}

.solver-ui .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 18px;
    opacity: 0.7;
}

.solver-ui .close-btn:hover {
    opacity: 1;
}

.solver-ui .keybind-info {
    margin: 0;
    padding: 0;
    border: none;
    font-size: 12px;
    color: #888;
}

.solver-ui .reveal-row {
    justify-content: space-between;
    margin-top: 20px;
    gap: 10px;
}

.solver-ui .reveal-btn {
    flex: 1;
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
}

.solver-ui .reveal-btn:hover {
    background: #45a049;
}

.solver-ui .author {
    display: block;
    margin-top: 5px;
    font-style: italic;
    color: #666;
    text-align: center;
}

.solver-ui .setting-group {
    border: 1px solid #333;
    border-radius: 4px;
    padding: 10px;
    margin: 15px 0;
}

.solver-ui .delay-row {
    opacity: 1;
    transition: opacity 0.3s;
}

.solver-ui .delay-row.disabled {
    opacity: 0.5;
}

.solver-ui .delay-row input[disabled] {
    cursor: not-allowed;
    background: #222;
}

.solver-ui select {
    padding: 4px;
    border: 1px solid #333;
    background: #2a2a2a;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
}

.solver-ui select:focus {
    outline: none;
    border-color: #4CAF50;
}

.solver-ui .buttons-container {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.solver-ui .button-row {
    display: flex;
    gap: 10px;
    justify-content: space-between;
    width: 100%;
}

.solver-ui .button-row:last-child {
    margin-top: 5px;
}

.solver-ui .reveal-btn {
    flex: 1;
    width: 100%;
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
}

.solver-ui .reveal-btn:hover {
    background: #45a049;
}

.solver-ui .search-btn {
    background: #2196F3;
}

.solver-ui .search-btn:hover {
    background: #1976D2;
}

.solver-ui .api-key-row.hidden {
    display: none;
}

.solver-ui input[type="password"] {
    width: 200px;
    padding: 4px;
    border: 1px solid #333;
    background: #2a2a2a;
    color: #fff;
    border-radius: 4px;
}

.solver-ui .footer-divider {
    border: none;
    border-top: 1px solid #333;
    margin: 15px 0 10px 0;
}

.solver-ui .footer-content {
    text-align: center;
    font-size: 12px;
    color: #888;
}

/* Mobile specific styles */
.solver-mobile-toggle {
    position: fixed;
    top: 10px;
    left: 10px;
    width: 40px;
    height: 40px;
    background: #1a1a1a;
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 20px;
    z-index: 9999;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.solver-mobile-toggle:hover {
    background: #2a2a2a;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
    .solver-ui {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin: 0;
        width: 90%;
        max-width: 400px;
        max-height: 90vh;
        overflow-y: auto;
    }

    .solver-ui .setting-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }

    .solver-ui input[type="number"],
    .solver-ui input[type="password"],
    .solver-ui select {
        width: 100%;
    }

    .solver-ui .button-row {
        flex-direction: column;
        gap: 8px;
    }

    .solver-ui .button-row button {
        width: 100%;
    }
}
`; 