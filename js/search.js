/**
 * MODUL PENCARIAN & KENDALI VIEW DETAIL STRUK
 * Menjamin 100% sistem pencarian instan berdasar ID unik berjalan lancar.
 */

const SearchEngine = {
    initSearch: function() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('btn-search');
        const resultContainer = document.getElementById('search-result-container');

        const performSearch = () => {
            const query = searchInput.value.trim().toUpperCase();
            resultContainer.innerHTML = ''; // Reset container

            if (!query) {
                resultContainer.innerHTML = `<p style="color: var(--pink);">Ketik kode unik terlebih dahulu!</p>`;
                return;
            }

            // Cari data direct dari storage layer
            const targetReceipt = StorageEngine.getReceiptById(query);

            if (targetReceipt) {
                // Buat wrapper paper nota hasil pencarian
                const searchPaperId = `search-render-${targetReceipt.id}`;
                resultContainer.innerHTML = `
                    <div style="width:100%; text-align:center;">
                        <p style="color: var(--cyan); margin-bottom: 1rem;"><i class="fa-solid fa-circle-check"></i> Struk Ditemukan!</p>
                        <div id="${searchPaperId}" class="receipt-paper"></div>
                        <button class="btn btn-primary" id="btn-open-search-detail" style="margin-top: 1.5rem;">
                            <i class="fa-solid fa-expand"></i> Buka Full View & Download
                        </button>
                    </div>
                `;
                
                // Render detail nota ke hasil pencarian
                ReceiptEngine.renderHTML(targetReceipt, searchPaperId, true);

                // Integrasi link navigasi ke halaman detail utama
                document.getElementById('btn-open-search-detail').onclick = () => {
                    AppRouter.viewDetail(targetReceipt.id);
                };

            } else {
                resultContainer.innerHTML = `
                    <div style="text-align: center; color: var(--text-muted); margin-top: 2rem;">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: var(--pink); margin-bottom: 1rem;"></i>
                        <p>Kode struk <strong>"${query}"</strong> tidak terdaftar di sistem.</p>
                    </div>
                `;
            }
        };

        // Eksekusi ketika tombol diklik atau tekan Enter
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
};
