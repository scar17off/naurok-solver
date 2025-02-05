import { styles } from './styles';
import { ConfigManager } from '../config';

export class UIWindow {
    constructor(title, configManager = new ConfigManager()) {
        this.isVisible = false;
        this.elements = new Map();
        this.title = title;
        this.configManager = configManager;
        this.container = this.createContainer();
        this.styleElement = this.createStyles();
        this.setupDragging();
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'solver-ui';
        container.innerHTML = `
            <button class="close-btn">×</button>
            <h2>${this.title}</h2>
            <div class="content"></div>
            <div class="footer"></div>
        `;

        container.querySelector('.close-btn').addEventListener('click', () => this.hide());
        
        return container;
    }

    createStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        return styleElement;
    }

    addToggle(id, label, defaultValue, onChange) {
        const value = this.configManager.getValue(id) ?? defaultValue;
        const row = document.createElement('div');
        row.className = 'setting-row';
        row.innerHTML = `
            <label>${label}</label>
            <input type="checkbox" id="${id}" ${value ? 'checked' : ''}>
        `;

        const input = row.querySelector('input');
        input.addEventListener('change', (e) => {
            this.configManager.setValue(id, e.target.checked);
            onChange?.(e.target.checked);
        });
        
        this.container.querySelector('.content').appendChild(row);
        this.elements.set(id, input);
        return this;
    }

    addSelect(id, label, options, defaultValue, onChange) {
        const value = this.configManager.getValue(id) ?? defaultValue;
        const row = document.createElement('div');
        row.className = 'setting-row';
        row.innerHTML = `
            <label>${label}</label>
            <select id="${id}">
                ${Object.entries(options).map(([optValue, text]) => `
                    <option value="${optValue}" ${optValue === value ? 'selected' : ''}>
                        ${text}
                    </option>
                `).join('')}
            </select>
        `;

        const select = row.querySelector('select');
        select.addEventListener('change', (e) => {
            this.configManager.setValue(id, e.target.value);
            onChange?.(e.target.value);
        });
        
        this.container.querySelector('.content').appendChild(row);
        this.elements.set(id, select);
        return this;
    }

    addNumberInput(id, label, defaultValue, min, max, step, onChange) {
        const value = this.configManager.getValue(id) ?? defaultValue;
        const row = document.createElement('div');
        row.className = 'setting-row';
        row.innerHTML = `
            <label>${label}</label>
            <input type="number" id="${id}" 
                value="${value}"
                min="${min || 0}"
                max="${max || ''}"
                step="${step || 1}">
        `;

        const input = row.querySelector('input');
        input.addEventListener('change', (e) => {
            const newValue = parseInt(e.target.value);
            this.configManager.setValue(id, newValue);
            onChange?.(newValue);
        });
        
        this.container.querySelector('.content').appendChild(row);
        this.elements.set(id, input);
        return this;
    }

    addColorPicker(id, label, defaultValue, onChange) {
        const value = this.configManager.getValue(id) ?? defaultValue;
        const row = document.createElement('div');
        row.className = 'setting-row';
        row.innerHTML = `
            <label>${label}</label>
            <input type="color" id="${id}" value="${value}">
        `;

        const input = row.querySelector('input');
        input.addEventListener('change', (e) => {
            this.configManager.setValue(id, e.target.value);
            onChange?.(e.target.value);
        });
        
        this.container.querySelector('.content').appendChild(row);
        this.elements.set(id, input);
        return this;
    }

    addButton(id, text, onClick, className = '') {
        const button = document.createElement('button');
        button.id = id;
        button.className = `reveal-btn ${className}`;
        button.textContent = text;
        button.addEventListener('click', onClick);
        
        this.container.querySelector('.content').appendChild(button);
        this.elements.set(id, button);
        return this;
    }

    addButtonRow(buttons) {
        const row = document.createElement('div');
        row.className = 'button-row';
        
        buttons.forEach(({ id, text, onClick, className = '' }) => {
            const button = document.createElement('button');
            button.id = id;
            button.className = `reveal-btn ${className}`;
            button.textContent = text;
            button.addEventListener('click', onClick);
            row.appendChild(button);
            this.elements.set(id, button);
        });
        
        this.container.querySelector('.content').appendChild(row);
        return this;
    }

    addGroup(id) {
        const group = document.createElement('div');
        group.className = 'setting-group';
        group.id = id;
        
        this.container.querySelector('.content').appendChild(group);

        // Return an object with methods to add elements to this group
        return {
            addToggle: (id, label, defaultValue, onChange) => {
                const value = this.configManager.getValue(id) ?? defaultValue;
                const row = document.createElement('div');
                row.className = 'setting-row';
                row.innerHTML = `
                    <label>${label}</label>
                    <input type="checkbox" id="${id}" ${value ? 'checked' : ''}>
                `;

                const input = row.querySelector('input');
                input.addEventListener('change', (e) => {
                    this.configManager.setValue(id, e.target.checked);
                    onChange?.(e.target.checked);
                });
                
                group.appendChild(row);
                this.elements.set(id, input);
                return this;
            },

            addNumberInput: (id, label, defaultValue, min, max, step, onChange) => {
                const value = this.configManager.getValue(id) ?? defaultValue;
                const row = document.createElement('div');
                row.className = 'setting-row delay-row';
                row.innerHTML = `
                    <label>${label}</label>
                    <input type="number" id="${id}" 
                        value="${value}"
                        min="${min || 0}"
                        max="${max || ''}"
                        step="${step || 1}">
                `;

                const input = row.querySelector('input');
                input.addEventListener('change', (e) => {
                    const newValue = parseInt(e.target.value);
                    this.configManager.setValue(id, newValue);
                    onChange?.(newValue);
                });
                
                group.appendChild(row);
                this.elements.set(id, input);
                return this;
            }
        };
    }

    addPasswordInput(id, label, defaultValue, placeholder, onChange) {
        const value = this.configManager.getValue(id) ?? defaultValue;
        const row = document.createElement('div');
        row.className = 'setting-row';
        row.innerHTML = `
            <label>${label}</label>
            <input type="password" id="${id}" 
                value="${value}"
                placeholder="${placeholder}">
        `;

        const input = row.querySelector('input');
        input.addEventListener('change', (e) => {
            this.configManager.setValue(id, e.target.value);
            onChange?.(e.target.value);
        });
        
        this.container.querySelector('.content').appendChild(row);
        this.elements.set(id, input);
        return row;
    }

    addFooter(text) {
        this.container.querySelector('.footer').innerHTML = `
            <hr class="footer-divider">
            <div class="footer-content">
                ${text}
            </div>
        `;
        return this;
    }

    getElement(id) {
        return this.elements.get(id);
    }

    show() {
        this.container.classList.add('visible');
        this.isVisible = true;
    }

    hide() {
        this.container.classList.remove('visible');
        this.isVisible = false;
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    mount() {
        if (!document.head.querySelector('#solver-styles')) {
            this.styleElement.id = 'solver-styles';
            document.head.appendChild(this.styleElement);
        }
        document.body.appendChild(this.container);
        return this;
    }

    setupDragging() {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        const dragStart = (e) => {
            if (e.target.tagName.toLowerCase() === 'input' || 
                e.target.tagName.toLowerCase() === 'select' || 
                e.target.className === 'close-btn') {
                return;
            }

            const rect = this.container.getBoundingClientRect();
            initialX = e.clientX - rect.left;
            initialY = e.clientY - rect.top;

            if (e.target === this.container.querySelector('h2')) {
                isDragging = true;
            }
        };

        const dragEnd = () => {
            isDragging = false;
        };

        const drag = (e) => {
            if (isDragging) {
                e.preventDefault();

                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                this.container.style.left = `${currentX}px`;
                this.container.style.top = `${currentY}px`;
                this.container.style.margin = '0';
            }
        };

        const header = this.container.querySelector('h2');
        header.style.cursor = 'move';
        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
    }
}