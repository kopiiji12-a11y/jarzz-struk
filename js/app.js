/**
 * APP MAIN CONTROLLER & APPLICATION ROUTER
 * Menghubungkan seluruh logika interface, manajemen form dinamis, update preview, dan library download.
 */

let base64LogoData = ""; // Menyimpan cache string image logo toko

const AppRouter = {
    // Fungsi ganti halaman / navigasi SPA (Single Page Application)
    switchPage: function(targetId) {
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if(btn.getAttribute('data-target') === targetId) btn.classList.add('active');
        });

        const activeSection = document.getElementById(targetId);
        if(activeSection) activeSection.classList.add('active');

        // Refresh stats/table jika balik ke dashboard
        if (targetId === 'dashboard') {
            this.loadDashboardData();
        }
    },

    // Membuka halaman detail nota
    viewDetail: function(receiptId) {
        this.switchPage('detail-receipt');
        const receipt = StorageEngine.getReceiptById(receiptId);
        if (receipt) {
            ReceiptEngine.renderHTML(receipt, 'printable-receipt-target', true);
            
            // Konfigurasi tombol download inject data ID terkini
            document.getElementById('btn-download-png').onclick = () => AppRouter.downloadAsPNG(receipt.id);
            document.getElementById('btn-download-pdf').onclick = () => AppRouter.downloadAsPDF(receipt.id);
        }
    },

    // Mengisi Dashboard dengan Statistik Konkrit
    loadDashboardData: function() {
        const data = StorageEngine.getAllReceipts();
        const totalCount = data.length;
        const totalRevenue = data.reduce((sum, item) => sum + item.total, 0);

        document.getElementById('stat-total-count').innerText = totalCount;
        document.getElementById('stat-total-revenue').innerText = ReceiptEngine.formatRupiah(totalRevenue);

        // Render tabel transaksi terbaru
        const tbody = document.getElementById('recent-transactions-list');
        tbody.innerHTML = '';

        if(totalCount === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Belum ada riwayat transaksi.</td></tr>`;
            return;
        }

        data.forEach(receipt => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${receipt.id}</strong></td>
                <td>${receipt.shopName}</td>
                <td>${receipt.date}</td>
                <td>${ReceiptEngine.formatRupiah(receipt.total)}</td>
                <td class="action-icons">
                    <button class="action-btn btn-view" title="Lihat Struk" onclick="AppRouter.viewDetail('${receipt.id}')"><i class="fa-solid fa-eye"></i></button>
                    <button class="action-btn btn-edit" title="Edit Struk" onclick="AppRouter.editReceiptTrigger('${receipt.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn btn-delete" title="Hapus Struk" onclick="AppRouter.deleteReceiptTrigger('${receipt.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    // Handler hapus data dari dashboard
    deleteReceiptTrigger: function(id) {
        if(confirm(`Yakin ingin menghapus struk ${id}?`)) {
            StorageEngine.deleteReceipt(id);
            this.loadDashboardData();
        }
    },

    // Handler isi form untuk edit data lama
    editReceiptTrigger: function(id) {
        const receipt = StorageEngine.getReceiptById(id);
        if(!receipt) return;

        this.switchPage('create-receipt');
        
        document.getElementById('edit-receipt-id').value = receipt.id;
        document.getElementById('shop-name').value = receipt.shopName;
        document.getElementById('shop-address').value = receipt.shopAddress;
        document.getElementById('customer-number').value = receipt.customerNumber || "";
        base64LogoData = receipt.logo || "";

        // Bersihkan & isi ulang item input dinamis
        const container = document.getElementById('product-items-container');
        container.innerHTML = '';
        receipt.items.forEach(item => AppRouter.addProductRow(item.name, item.qty, item.price));
        
        AppRouter.updateLivePreview();
    },

    // Tambah baris item dinamis pada input form
    addProductRow: function(name="", qty=1, price="") {
        const container = document.getElementById('product-items-container');
        const row = document.createElement('div');
        row.className = 'product-row';
        row.innerHTML = `
            <input type="text" class="p-name" placeholder="Nama Produk" value="${name}" required>
            <input type="number" class="p-qty" placeholder="Qty" min="1" value="${qty}" required>
            <input type="number" class="p-price" placeholder="Harga Satuan" value="${price}" required>
            <button type="button" class="action-btn btn-delete remove-row-btn"><i class="fa-solid fa-xmark"></i></button>
        `;

        // Event listener hapus item baris ini
        row.querySelector('.remove-row-btn').onclick = () => {
            row.remove();
            AppRouter.updateLivePreview();
        };

        // Event listener update live preview ketika diketik
        row.querySelectorAll('input').forEach(input => {
            input.oninput = () => AppRouter.updateLivePreview();
        });

        container.appendChild(row);
    },

    // Membaca form input saat ini dan melemparnya ke file preview nota kasir
    updateLivePreview: function() {
        const shopName = document.getElementById('shop-name').value || 'NAMA TOKO ANDA';
        const shopAddress = document.getElementById('shop-address').value || 'ALAMAT TOKO';
        const customerNumber = document.getElementById('customer-number').value || '';
        
        const items = [];
        document.querySelectorAll('.product-row').forEach(row => {
            const name = row.querySelector('.p-name').value;
            const qty = parseInt(row.querySelector('.p-qty').value) || 0;
            const price = parseInt(row.querySelector('.p-price').value) || 0;
            if(name) items.push({ name, qty, price });
        });

        const mockReceipt = {
            id: document.getElementById('edit-receipt-id').value || 'JZ-YYYYMMDD-XXXXXX',
            shopName,
            shopAddress,
            customerNumber,
            logo: base64LogoData,
            date: new Date().toLocaleString('id-ID'),
            items: items.length > 0 ? items : [{ name: 'Contoh Item', qty: 1, price: 50000 }],
            total: ReceiptEngine.calculateTotal(items.length > 0 ? items : [{ name: 'Contoh Item', qty: 1, price: 50000 }])
        };

        ReceiptEngine.renderHTML(mockReceipt, 'live-receipt-preview', false);
    },

    // DOWNLOAD SISTEM ENGINE: HTML Ke PNG Gambar Gambar
    downloadAsPNG: function(filename) {
        const element = document.getElementById('printable-receipt-target');
        html2canvas(element, { scale: 3, backgroundColor: '#ffffff' }).then(canvas => {
            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    },

    // DOWNLOAD SISTEM ENGINE: HTML Ke PDF Dokumen
    downloadAsPDF: function(filename) {
        const element = document.getElementById('printable-receipt-target');
        const opt = {
            margin:       0.2,
            filename:     `${filename}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 3 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    }
};

// ================= INITIAL LOADING SYSTEM TRIGGER =================
document.addEventListener('DOMContentLoaded', () => {
    // Jalankan router navigasi klik menu navbar
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.onclick = () => AppRouter.switchPage(btn.getAttribute('data-target'));
    });

    // Inisialisasi engine search
    SearchEngine.initSearch();

    // Tombol buat baru dari dashboard
    document.getElementById('btn-back-to-dash').onclick = () => AppRouter.switchPage('dashboard');

    // Tambah row produk bawaan di form input baru
    document.getElementById('btn-add-item').onclick = () => AppRouter.addProductRow();
    AppRouter.addProductRow(); // Entry pertama otomatis

    // Hubungkan deteksi pengetikan form text utama dengan preview
    document.getElementById('shop-name').oninput = () => AppRouter.updateLivePreview();
    document.getElementById('shop-address').oninput = () => AppRouter.updateLivePreview();
    document.getElementById('customer-number').oninput = () => AppRouter.updateLivePreview();

    // Mengurus file upload gambar diubah ke string Base64
    document.getElementById('shop-logo-input').onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (el) => {
                base64LogoData = el.target.result;
                AppRouter.updateLivePreview();
            };
            reader.readAsDataURL(file);
        }
    };

    // FORM ACTION SUBMIT SAVE HANDLER
    document.getElementById('receipt-form').onsubmit = () => {
        const existingId = document.getElementById('edit-receipt-id').value;
        const finalId = existingId ? existingId : ReceiptEngine.generateUniqueCode();
        
        const items = [];
        document.querySelectorAll('.product-row').forEach(row => {
            items.push({
                name: row.querySelector('.p-name').value,
                qty: parseInt(row.querySelector('.p-qty').value),
                price: parseInt(row.querySelector('.p-price').value)
            });
        });

        const receiptPayload = {
            id: finalId,
            shopName: document.getElementById('shop-name').value,
            shopAddress: document.getElementById('shop-address').value,
            customerNumber: document.getElementById('customer-number').value,
            logo: base64LogoData,
            date: existingId ? StorageEngine.getReceiptById(existingId).date : new Date().toLocaleString('id-ID'),
            items: items,
            total: ReceiptEngine.calculateTotal(items)
        };

        // Simpan ke storage local
        StorageEngine.saveReceipt(receiptPayload);
        fetch('/api/send-struk', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(receiptPayload)
})
.then(res => res.json())
.then(data => {
console.log('API Response:', data);
})
.catch(err => {
console.error('API Error:', err);
});


        // Reset form & cache status
        document.getElementById('receipt-form').reset();
        document.getElementById('edit-receipt-id').value = '';
        document.getElementById('product-items-container').innerHTML = '';
        base64LogoData = "";
        AppRouter.addProductRow(); // Buka row kosongan baru

        // Direct pindah lempar view ke lembar nota detail final
        AppRouter.viewDetail(finalId);
    };

    // MANAGEMENT DATA ACTION CLICK LOGIC
    document.getElementById('btn-export').onclick = () => StorageEngine.exportToJSON();
    document.getElementById('btn-import').onchange = (e) => {
        if(e.target.files.length > 0) {
            StorageEngine.importFromJSON(e.target.files[0], (success, msg) => {
                alert(msg);
                if(success) AppRouter.loadDashboardData();
            });
        }
    };

    // Render dashboard data final awal pembuka
    AppRouter.loadDashboardData();
});
