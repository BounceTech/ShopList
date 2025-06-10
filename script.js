document.addEventListener('DOMContentLoaded', () => {
    const shoppingListDiv = document.getElementById('shopping-list');
    const itemNameInput = document.getElementById('itemNameInput');
    const itemPriceInput = document.getElementById('itemPriceInput');
    const addItemButton = document.getElementById('addItemButton');
    const totalAmountSpan = document.getElementById('totalAmount');
    const finishShoppingButton = document.getElementById('finishShoppingButton');

    // Funzione per aggiornare il totale
    const updateTotalPrice = () => {
        let currentTotal = 0;
        document.querySelectorAll('.item-card').forEach(itemCard => {
            const originalPriceText = itemCard.querySelector('.original-price').textContent;
            const originalPrice = parseFloat(originalPriceText.replace(',', '.')); // Prezzo base
            const quantityText = itemCard.querySelector('.item-quantity').textContent;
            const quantity = parseInt(quantityText); // Quantità

            if (!isNaN(originalPrice) && !isNaN(quantity) && quantity > 0) {
                currentTotal += originalPrice * quantity;
            }
        });
        totalAmountSpan.textContent = currentTotal.toFixed(2).replace('.', ',') + '€'; // Formato italiano
    };

    // Funzione per gestire l'aumento/diminuzione della quantità
    const handleQuantityChange = (event) => {
        const button = event.target;
        const itemCard = button.closest('.item-card');
        const quantitySpan = itemCard.querySelector('.item-quantity');
        let currentQuantity = parseInt(quantitySpan.textContent);

        if (button.classList.contains('increase-quantity')) {
            currentQuantity++;
        } else if (button.classList.contains('decrease-quantity')) {
            if (currentQuantity > 1) { // Non scendere sotto 1
                currentQuantity--;
            }
        }

        quantitySpan.textContent = currentQuantity; // Aggiorna il numero visualizzato

        const originalPriceText = itemCard.querySelector('.original-price').textContent;
        const originalPrice = parseFloat(originalPriceText.replace(',', '.'));

        // Ricalcola il prezzo dell'articolo basato sulla nuova quantità
        const newCalculatedPrice = originalPrice * currentQuantity;
        itemCard.querySelector('.item-price').textContent = newCalculatedPrice.toFixed(2).replace('.', ',') + '€';

        updateTotalPrice(); // Aggiorna il totale generale
    };

    // Funzione per aggiungere un articolo
    const addItem = (name, price) => {
        if (!name || name.trim() === '') {
            alert("Per favore, inserisci il nome dell'articolo.");
            return;
        }
        if (isNaN(price) || price <= 0) {
            alert("Per favore, inserisci un prezzo valido (un numero maggiore di zero).");
            return;
        }

        const itemCard = document.createElement('div');
        itemCard.classList.add('item-card', 'fade-in');
        itemCard.innerHTML = `
            <span class="item-name">${name}</span>
            <span class="original-price" style="display:none;">${price.toFixed(2).replace('.', ',')}</span>
            <span class="item-price">${price.toFixed(2).replace('.', ',')}€</span>
            <div class="quantity-controls">
                <button class="decrease-quantity">-</button>
                <span class="item-quantity">1</span>
                <button class="increase-quantity">+</button>
            </div>
            <button class="remove-item">X</button>
        `;

        shoppingListDiv.appendChild(itemCard);

        // Aggiungi event listeners per il nuovo articolo
        itemCard.querySelector('.remove-item').addEventListener('click', (event) => {
            itemCard.classList.remove('fade-in');
            itemCard.classList.add('fade-out');
            itemCard.addEventListener('animationend', () => {
                itemCard.remove();
                updateTotalPrice();
            }, { once: true });
        });

        // Aggiungi event listeners per i pulsanti di quantità del nuovo articolo
        itemCard.querySelector('.increase-quantity').addEventListener('click', handleQuantityChange);
        itemCard.querySelector('.decrease-quantity').addEventListener('click', handleQuantityChange);

        itemNameInput.value = '';
        itemPriceInput.value = '';
        updateTotalPrice();
        itemNameInput.focus();
    };

    // Gestione dell'aggiunta di un nuovo articolo
    addItemButton.addEventListener('click', () => {
        const name = itemNameInput.value.trim();
        const price = parseFloat(itemPriceInput.value.replace(',', '.'));

        addItem(name, price);
    });

    // Permetti di aggiungere con "Invio" nei campi input
    itemNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            itemPriceInput.focus();
        }
    });

    itemPriceInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addItemButton.click();
        }
    });

    // Inizializza event listeners per gli articoli predefiniti all'avvio
    document.querySelectorAll('.item-card').forEach(itemCard => {
        // Remove button
        itemCard.querySelector('.remove-item').addEventListener('click', (event) => {
            const currentItemCard = event.target.closest('.item-card');
            if (currentItemCard) {
                currentItemCard.classList.remove('fade-in');
                currentItemCard.classList.add('fade-out');
                currentItemCard.addEventListener('animationend', () => {
                    currentItemCard.remove();
                    updateTotalPrice();
                }, { once: true });
            }
        });

        // Quantity buttons
        itemCard.querySelector('.increase-quantity').addEventListener('click', handleQuantityChange);
        itemCard.querySelector('.decrease-quantity').addEventListener('click', handleQuantityChange);
    });

    // Funzione per generare il PDF con jsPDF
    const generatePdf = () => {
        const items = [];
        document.querySelectorAll('.item-card').forEach(itemCard => {
            const name = itemCard.querySelector('.item-name').textContent;
            const originalPrice = parseFloat(itemCard.querySelector('.original-price').textContent.replace(',', '.'));
            const quantity = parseInt(itemCard.querySelector('.item-quantity').textContent);
            const calculatedPrice = (originalPrice * quantity).toFixed(2).replace('.', ','); // Prezzo calcolato per l'articolo

            items.push({ name, quantity, price: calculatedPrice + '€', originalPrice: originalPrice.toFixed(2).replace('.', ',') + '€/pz' });
        });

        if (items.length === 0) {
            alert("Nessun articolo da salvare nel PDF.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const margin = 20;
        let y = margin;

        // Titolo
        doc.setFontSize(22);
        doc.text("Riepilogo Spesa", 105, y, { align: 'center' });
        y += 10;
        doc.setFontSize(12);
        const date = new Date().toLocaleDateString('it-IT');
        doc.text(`Data: ${date}`, 105, y, { align: 'center' });
        y += 20;

        // Header della tabella
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text("Articolo", margin, y);
        doc.text("Q.tà", margin + 70, y, { align: 'center' }); // Posizione per quantità
        doc.text("Prezzo (pz)", margin + 110, y, { align: 'right' }); // Posizione per prezzo unitario
        doc.text("Totale", 180 - margin, y, { align: 'right' }); // Posizione per prezzo totale articolo
        y += 5;
        doc.setLineWidth(0.5);
        doc.line(margin, y, 210 - margin, y);
        y += 10;

        // Lista degli articoli
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        items.forEach(item => {
            doc.text(item.name, margin, y);
            doc.text(item.quantity.toString(), margin + 70, y, { align: 'center' });
            doc.text(item.originalPrice, margin + 110, y, { align: 'right' });
            doc.text(item.price, 180 - margin, y, { align: 'right' });
            y += 10;
            if (y > 280) {
                doc.addPage();
                y = margin;
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text("Articolo", margin, y);
                doc.text("Q.tà", margin + 70, y, { align: 'center' });
                doc.text("Prezzo (pz)", margin + 110, y, { align: 'right' });
                doc.text("Totale", 180 - margin, y, { align: 'right' });
                y += 5;
                doc.setLineWidth(0.5);
                doc.line(margin, y, 210 - margin, y);
                y += 10;
                doc.setFontSize(12);
                doc.setFont(undefined, 'normal');
            }
        });

        // Linea prima del totale
        y += 10;
        doc.setLineWidth(1);
        doc.line(margin, y, 210 - margin, y);
        y += 10;

        // Totale generale
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(`Totale complessivo: ${totalAmountSpan.textContent}`, 180 - margin, y, { align: 'right' });

        doc.save(`Spesa_${new Date().toISOString().slice(2, 10)}.pdf`);
    };

    // Gestione del tasto "Fine spesa"
    finishShoppingButton.addEventListener('click', () => {
        const currentTotalAmount = parseFloat(totalAmountSpan.textContent.replace('€', '').replace(',', '.'));

        if (currentTotalAmount > 0) {
            generatePdf();
            const itemCards = Array.from(document.querySelectorAll('.item-card'));
            let delay = 0;
            itemCards.forEach((itemCard, index) => {
                setTimeout(() => {
                    itemCard.classList.add('fade-out');
                    itemCard.addEventListener('animationend', () => {
                        itemCard.remove();
                        if (index === itemCards.length - 1) {
                            updateTotalPrice();
                        }
                    }, { once: true });
                }, delay);
                delay += 70;
            });
        } else {
            alert("Il carrello è vuoto. Aggiungi degli articoli prima di terminare la spesa.");
        }
    });

    // Aggiorna il totale iniziale quando la pagina carica
    updateTotalPrice();
});