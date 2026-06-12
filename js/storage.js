/**
 * ENGINE PENYIMPANAN LOCALSTORAGE
 * Menangani Create, Read, Update, Delete (CRUD) serta Export/Import JSON.
 */

const STORAGE_KEY = 'JZ_RECEIPT_DATA';

const StorageEngine = {
    // Mengambil seluruh data struk
    getAllReceipts: function() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Menyimpan array data baru ke LocalStorage
    saveAllReceipts: function(receiptsArray) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(receiptsArray));
    },

    // Mendapatkan satu item struk berdasarkan kode unik
    getReceiptById: function(id) {
        const receipts = this.getAllReceipts();
        return receipts.find(r => r.id === id) || null;
    },

    // Menambah data baru atau Mengedit data lama
    saveReceipt: function(receiptData) {
        const receipts = this.getAllReceipts();
        const index = receipts.findIndex(r => r.id === receiptData.id);

        if (index !== -1) {
            // Mode Update/Edit
            receipts[index] = receiptData;
        } else {
            // Mode Create Baru
            receipts.unshift(receiptData); // Taruh di baris paling atas
        }
        
        this.saveAllReceipts(receipts);
        return true;
    },

    // Menghapus data berdasarkan ID
    deleteReceipt: function(id) {
        let receipts = this.getAllReceipts();
        receipts = receipts.filter(r => r.id !== id);
        this.saveAllReceipts(receipts);
    },

    // Export database ke file format JSON
    exportToJSON: function() {
        const dataStr = JSON.stringify(this.getAllReceipts(), null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.download = `JZ-Receipts-Backup-${new Date().toISOString().slice(0,10)}.json`;
        link.href = url;
        link.click();
    },

    // Mengganti/menggabungkan database dari file luar
    importFromJSON: function(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    this.saveAllReceipts(importedData);
                    callback(true, "Data backup berhasil di-import!");
                } else {
                    callback(false, "Format berkas JSON tidak valid.");
                }
            } catch (err) {
                callback(false, "Gagal membaca file JSON.");
            }
        };
        reader.readAsText(file);
    }
};
