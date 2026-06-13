/**
 * MODUL GENERATE & CETAK STRUK
 * Bertanggung jawab mengurus komputasi matematis kasir, kode unik, dan render visual.
 */

const ReceiptEngine = {
    // Fungsi pembuat string acak untuk format JZ-YYYYMMDD-XXXXXX
    generateUniqueCode: function() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${date}`;

        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Tanpa O/I/0/1 agar tidak membingungkan kasir
        let randomStr = '';
        for (let i = 0; i < 6; i++) {
            randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return `JZ-${dateStr}-${randomStr}`;
    },

    // Format angka ke mata uang Rupiah
    formatRupiah: function(angka) {
        return 'Rp ' + parseInt(angka).toLocaleString('id-ID');
    },

    // Menghitung subtotal dari array objek produk
    calculateTotal: function(items) {
        return items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    },

    // Merender struktur DOM HTML dari sebuah objek struk ke container tertentu
    renderHTML: function(receipt, containerId, hasQr = true) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Ambil logo jika ada, jika tidak pakai placeholder default
        const logoHtml = receipt.logo ? `<img src="${receipt.logo}" class="receipt-logo" alt="Logo">` : '';

        // Generate baris item tabel belanjaan
        let itemsHtml = '';
        receipt.items.forEach(item => {
            const subtotal = item.qty * item.price;
            itemsHtml += `
                <tr>
                    <td>${item.name}<br><small>${item.qty} x ${this.formatRupiah(item.price)}</small></td>
                    <td class="text-right" style="vertical-align: bottom;">${this.formatRupiah(subtotal)}</td>
                </tr>
            `;
        });

        // Set layout innerHTML nota kasir
        container.innerHTML = `
            <div class="receipt-header">
                ${logoHtml}
                <div class="receipt-shop-name">${receipt.shopName}</div>
                <div class="receipt-shop-address">${receipt.shopAddress}</div>
            </div>
            <div class="receipt-divider"></div>
            <div class="receipt-meta">
                <div class="receipt-meta-row"><span>KODE:</span> <strong>${receipt.id}</strong></div>
                <div class="receipt-meta-row"><span>TANGGAL:</span> <span>${receipt.date}</span></div>
                ${receipt.customerNumber ? `<div class="receipt-meta-row"><span>NO. CUST:</span> <span>${receipt.customerNumber}</span></div>` : ''}
            </div>
            <div class="receipt-divider"></div>
            <table class="receipt-table">
                <thead>
                    <tr>
                        <th style="text-align: left;">Item/Qty</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            <div class="receipt-divider"></div>
            <div class="receipt-totals">
                <div class="receipt-total-row receipt-grand-total">
                    <span>GRAND TOTAL</span>
                    <span>${this.formatRupiah(receipt.total)}</span>
                </div>
            </div>
            <div class="receipt-footer">
                <p>Terima Kasih Atas Kunjungan Anda</p>
                <p>Powered by JZ Receipt</p>
                ${hasQr ? `<div class="receipt-qrcode" id="qr-target-${receipt.id}"></div>` : ''}
            </div>
        `;

        // Generate QR Code otomatis melampirkan teks ID Nota
        if (hasQr) {
            setTimeout(() => {
                new QRCode(document.getElementById(`qr-target-${receipt.id}`), {
                    text: receipt.id,
                    width: 90,
                    height: 90,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            }, 50);
        }
    }
};
