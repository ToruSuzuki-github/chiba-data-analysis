//======================================================================
// Program name: app_day2_002_009.js
// Description: Two layers (administrative districts and medical providers)
//======================================================================
// Variable
//======================================================================



//======================================================================
// Functions（行政区分）
//======================================================================



//======================================================================
// Functions（人口メッシュ）
//======================================================================
function meshPopup(feature,layer){
	var mesh_id = feature.properties.MESH_ID;
	var city_code = feature.properties.CITY_CODE;
	var content = mesh_id+":"+city_code;
	layer.bindPopup(content);
};

//======================================================================
// function（共通）
//======================================================================



//======================================================================
// Main function
//======================================================================

//データの読み出しと処理、描画
jQuery(document.body).ready(function ($) {
	//L.mapコンストラクタによるmapオブジェクトの生成
	var latlng = [35.6920, 140.0486] //地図の中心座標

	//地図の表示
	var map = L.map('map',
		{
			center: latlng, //地図の中心を指定
			zoom: 15, //ズームを指定
			//preferCanvas: true //表示の高速化
		});

	//{s}手段利用可能なサブドメインの1つ（ドメイン制限あたりブラウザ平行要求を支援するために順次使用;サブドメイン値はオプションで指定されている; a、bまたはcデフォルトで、省略することができる）、{z}-ズームレベル、{x}および{y}-タイル座標。{r}URLに「@ 2x」を追加して網膜タイルをロードするために使用できます。テンプレートでカスタムキーを使用できます。これは、次のようにTileLayerオプションから評価されます。
	var titleLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
	titleLayer.addTo(map);

	//人口レイヤー（メッシュ）の表示
	var popLayer = L.geoJson(chiba_base_mesh, {
		onEachFeature: meshPopup
	});
	popLayer.addTo(map);

	//

	//ガソリンスタンド(マーカー)の表示
	//var gasLayer = L.geoJson(chiba_gas_station).addTo(map);
	var gasLayer = L.geoJson(chiba_gas_station,{
		pointToLayer: function(feature, latlang){
			var address = feature.properties.P07_002;
			//施設名　改行　住所
			//var facilityName = "ガソリンスタンド";
			//var contents = facilityName + <br> +
			var x = L.circleMarker(latlang,{
				radius: 3, //円の半径
				fill: true, //円の内部を塗りつぶすかどうか
				color: 'blue', //色
				weight: 1 //円の線幅
			}).bindPopup(address);
			
			return x;
		}
	}).addTo(map);
});