let currentTRX = "";

function generate(){

  const toko=document.getElementById("toko").value;
  const barang=document.getElementById("barang").value;
  const harga=Number(document.getElementById("harga").value);
  const qty=Number(document.getElementById("qty").value);
  const total=harga*qty;

  // 🔢 KODE UNIK
  currentTRX = "TRX-" + Date.now() + "-" + Math.floor(Math.random()*9000);

  document.getElementById("tokoOut").innerText=toko||"TOKO";
  document.getElementById("itemOut").innerText=barang;
  document.getElementById("hargaOut").innerText=harga;
  document.getElementById("qtyOut").innerText=qty;
  document.getElementById("totalOut").innerText=total;

  document.getElementById("time").innerText=new Date().toLocaleString();

  // tampilkan kode transaksi
  if(!document.getElementById("trxOut")){
    const div=document.createElement("div");
    div.id="trxOut";
    div.style.textAlign="center";
    div.style.marginTop="5px";
    document.getElementById("receipt").appendChild(div);
  }
  document.getElementById("trxOut").innerText=currentTRX;

  // QRIS
  document.getElementById("qrcode").innerHTML="";
  new QRCode(document.getElementById("qrcode"),{
    text:`QRIS|${currentTRX}|${total}`,
    width:120,
    height:120
  });

  // BARCODE
  JsBarcode("#barcode", currentTRX, {
    format:"CODE128",
    width:2,
    height:50,
    displayValue:true
  });

  // 💾 SIMPAN KE LOCALSTORAGE
  const data = {
    trx: currentTRX,
    toko, barang, harga, qty, total,
    time: new Date().toLocaleString()
  };

  let all = JSON.parse(localStorage.getItem("dataStruk") || "[]");
  all.push(data);
  localStorage.setItem("dataStruk", JSON.stringify(all));
}

// 🔍 CARI STRUK
function searchTRX(){

  const key = document.getElementById("search").value;
  const all = JSON.parse(localStorage.getItem("dataStruk") || "[]");

  const found = all.find(item => item.trx === key);

  if(!found){
    alert("Struk tidak ditemukan ❌");
    return;
  }

  document.getElementById("tokoOut").innerText = found.toko;
  document.getElementById("itemOut").innerText = found.barang;
  document.getElementById("hargaOut").innerText = found.harga;
  document.getElementById("qtyOut").innerText = found.qty;
  document.getElementById("totalOut").innerText = found.total;
  document.getElementById("time").innerText = found.time;

  if(!document.getElementById("trxOut")){
    const div=document.createElement("div");
    div.id="trxOut";
    div.style.textAlign="center";
    document.getElementById("receipt").appendChild(div);
  }
  document.getElementById("trxOut").innerText = found.trx;
}
