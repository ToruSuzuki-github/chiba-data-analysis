//======================================================================
// Program name: app_day2_002_009.js
// Description: Two layers (administrative districts and medical providers)
//======================================================================
// Variable
//======================================================================
var code2city = [];//連想型配列（自治体コード⇒自治体名）
var code2count = [];//集計用配列
var code2count_all = [];//全医療機関の集計用配列
var code2count_hosp = [];//病院のみの集計用配列
var circleMarkerOptions = {//マーカーの設定
	radius: 5,
	color: '#ff0000'
};

//======================================================================
// Functions（行政区分）
//======================================================================
function myPopup(feature, layer) {
	var pref = feature.properties.N03_001;//都道府県名
	var county = feature.properties.N03_003;//郡または政令指定都市名
	var city = feature.properties.N03_004;//市町村名または政令指定都市の区名
	var div_code = feature.properties.N03_007;//自治体コード
	var name = "";
	if (county) {
		//郡または政令指定都市名が定義されているとき
		//name=県名＋群名＋町村名
		//name=県名＋政令指定都市名＋区名
		name = pref + county + city;
	}
	else {
		//name=県名＋市名
		name = pref + city;
	}
	// layer.bindPopup(name);

	// 新しい市町村が入力されたとき
	// ⇒市町村コードと市町村名の組み合わせの配列にないとき
	if (!code2city[div_code]) {
		code2city[div_code] = name;
	}
	// 市町村名と自治体コードを出力
	layer.bindPopup(name + ":" + div_code);
}
function newPopup(layer) {
	var pref = layer.feature.properties.N03_001;
	var county = layer.feature.properties.N03_003;
	var city = layer.feature.properties.N03_004;
	var div_code = layer.feature.properties.N03_007;
	var name = "";
	if (county) {
		name = pref + county + city;
	}
	else {
		name = pref + city;
	}
	// Get the number of hospitals or clinics
	var num_hosp = code2count[div_code];
	if (!num_hosp) {
		num_hosp = 0;
	}
	var content = name + ":" + div_code + ":" + num_hosp;
	return content;
}

//病院だけの時のスタイルを決める関数
function newStyle_1(feature) {
	var area_code = feature.properties.N03_007;
	var count = code2count[area_code];
	return {
		fillColor: color(count), //ポリゴン内部の色
		weight: 1, //線の太さ
		opacity: 1, //線の不透明度
		color: 'white', //線の色
		fillOpacity: 0.5 //ポリゴン内部の不透明度
	};
}
//全医療機関の時のスタイルを決める関数
function newStyle_2(feature) {
	var area_code = feature.properties.N03_007;
	var count = code2count[area_code];
	count = count / 10; //値の調節（全医療機関にすると数が増えるため）
	return {
		fillColor: color(count), //ポリゴン内部の色
		weight: 1, //線の太さ
		opacity: 1, //線の不透明度
		color: 'white', //線の色
		fillOpacity: 0.5 //ポリゴン内部の不透明度
	};
}
function search_code(name) {
	for (var code in code2city) {
		var city = code2city[code];
		var match_result = name.indexOf(city);
		//バックアップ用
		//console.log(match_result + ":" + city + ":" + name);
		if (match_result != -1) {
			return code;
		}
	}
}

//======================================================================
// Functions（メッシュ）
//======================================================================

//最初にメッシュを表示するときのポップアップの設定
//メッシュのポップアップでは、メッシュIDと自治体IDを表示します。
function meshPopup(feature, layer) {
	//console.log(feature.properties.MESH_ID);

	//必要なデータの取得と作成
	var mesh_id = feature.properties.MESH_ID; //メッシュID
	var city_code = feature.properties.CITY_CODE; //自治体ID
	var content = mesh_id + ":" + city_code;

	//レイヤーにポップアップを表示
	layer.bindPopup(content);

};

//ラジオボタンでマーカーレイヤーを選択したとき、メッシュレイヤーへの
//bindPopupメソッドの引数となる、ポップアップ内容の設定。
//マーカー数が加わります。
function meshNewPopup(layer) {

	//必要なデータの取得と作成
	var mesh_id = layer.feature.properties.MESH_ID;
	var city_code = layer.feature.properties.CITY_CODE;
	var count = code2count[mesh_id];
	var content = mesh_id + ":" + city_code + ":" + count;

	//メッシュのポップアップ内容の更新
	return content;
};

//マーカーレイヤーを作成した時のポップアップの設定。オプションオブジェクトの、
//pointToLayerプロパティの値となります。
//マーカーのポップアップでは名称、診療科、メッシュIDを表示します
function meshMyPoint(feature, latlng) {

	//必要なデータの取得、作成
	var name = feature.properties.P04_002;
	var dep = feature.properties.P04_004;
	var type = feature.properties.P04_001;
	var mesh_id = getMeshId(latlng);
	//console.log(latlng);
	var content = name + ":<br>" + dep + ":<br>" + mesh_id;

	//マーカーとマーカーのポップアップの作成
	x = L.circleMarker(latlng, circleMarkerOptions).bindPopup(content);
	return x;
};

//病院だけのマーカーレイヤーを作るとき、オプションオブジェクトの、
//filterプロパティの値となる、病院だけを選ぶ関数。
function onlyHosp(feature) {
	switch (feature.properties.P04_001) {

		//P04_001=1は病院を示している
		case "1": return true;
		default: return false;
	}
};

//病院だけのレイヤーを選んだときの、メッシュのスタイルの設定。
function meshNewStyle_1(feature) {

	//必要なデータの取得、作成
	var mesh_id = feature.properties.MESH_ID;
	var count = code2count_hosp[mesh_id];

	//メッシュスタイルの設定
	return {
		fillColor: color(count),
		weight: 1,
		opacity: 1,
		color: 'white',
		fillOpacity: 0.5
	};
}
//病医院のレイヤーを選んだときの、メッシュのスタイルの設定。
//あとのcolor関数のダイナミックレンジに対応するために、数を10で割っています。
function meshNewStyle_2(feature) {

	//必要なデータの取得、作成
	var mesh_id = feature.properties.MESH_ID;
	var count = code2count_all[mesh_id];
	count = count / 10;

	//メッシュスタイルの設定
	return {
		fillColor: color(count),
		weight: 1,
		opacity: 1,
		color: 'white',
		fillOpacity: 0.5
	};
}

/*
地域メッシュ・コードの算出式 ※緯度・経度は10進数に変換して算出します。
・緯度×60分÷40分＝ｐ 余りａ
・ ａ÷５分＝ｑ 余りｂ
・ ｂ×60秒÷30秒＝ｒ 余りｃ
・ ｃ÷15秒＝ｓ 余りｄ
・ ｄ÷7.5秒＝ｔ 余りｅ
・経度－100度＝ｕ 余りｆ
・ ｆ×60分÷７分30秒＝ｖ 余りｇ
・ ｇ×60秒÷45秒＝ｗ 余りｈ
・ ｈ÷22.5秒＝ｘ 余りｉ
・ ｉ÷11.25秒＝ｙ 余りｊ
・ （ｓ×２）＋（ｘ＋１）＝ｍ
・ （ｔ×２）＋（ｙ＋１）＝ｎ
基準地域メッシュ・コードは pu qv rw の順に組み合わせたもの
２分の１地域メッシュ・コードは pu qv rw m の順に組み合わせたもの
４分の１地域メッシュ・コードは pu qv rw m n の順に組み合わせたもの
*/
//メッシュID（メッシュ・コード）の算出と取得
function getMeshId(latlng) {

	//lat：緯度、lng：経度
	var lat = latlng.lat;
	var lng = latlng.lng;

	//Math.floor：与えられた数値以下の最大整数

	//緯度に関する計算
	// 緯度×60分÷40分＝ｐ(first) 余りａ(first_rest)
	var first = Math.floor(lat * 60 / 40);
	var first_rest = lat * 60 % 40;

	//ａ(first_rest)÷５分＝ｑ(second) 余りｂ(second_rest)
	var second = Math.floor(first_rest / 5);
	var second_rest = first_rest % 5;

	//ｂ(second_rest)×60秒÷30秒＝ｒ(third) 余りｃ
	//※基準地域メッシュコードはcを必要としないため未計算
	var third = Math.floor(second_rest * 2);

	//ｄ÷7.5秒＝ｔ 余りｅ

	//経度に関する計算
	//経度－100度＝ｕ(first_2) 余りｆ(first_2_rest)
	var first_2 = Math.floor(lng - 100);
	var first_2_rest = lng - 100 - first_2;

	//ｆ(first_2_rest)×60分÷７分30秒＝ｖ(second_2) 余りｇ(second_2_rest)
	var second_2 = Math.floor(first_2_rest * 60 / 7.5);
	var second_2_rest = (first_2_rest * 60) % 7.5;

	//ｇ(second_2_rest)×60秒÷45秒＝ｗ(third_2) 余りｈ
	//※基準地域メッシュコードはhを必要としないため未計算
	var third_2 = Math.floor(second_2_rest * 60 / 45);

	//ｉ÷11.25秒＝ｙ 余りｊ

	//２分の１地域メッシュ・コードの算出に必要な計算
	//（ｓ×２）＋（ｘ＋１）＝ｍ

	//４分の１地域メッシュ・コードの算出に必要な計算
	//（ｔ×２）＋（ｙ＋１）＝ｎ

	//console.log(first+":"+first_2+":"+second+":"+second_2+":"+third+":"+third_2+":"+mesh_id);
	//基準地域メッシュID（メッシュ・コード）
	//基準地域メッシュ・コードは pu qv rw の順に組み合わせたもの
	var mesh_id = first.toString() + first_2.toString()
		+ second.toString() + second_2.toString()
		+ third.toString() + third_2.toString();

	//２分の１地域メッシュ・コードは pu qv rw m の順に組み合わせたもの
	// var half_mesh_id = 
	//４分の１地域メッシュ・コードは pu qv rw m n の順に組み合わせたもの
	// var quarter_mesh_id =

	return mesh_id;
};

//全医療機関の集計
function meshCount_all(feature, layer) {
	var lat_lng = feature.geometry.coordinates;
	var latlng = L.latLng(lat_lng[1], lat_lng[0]);
	var mesh_id = getMeshId(latlng);
	if (!code2count_all[mesh_id]) {
		code2count_all[mesh_id] = 1;
	}
	else {
		code2count_all[mesh_id]++;
	}
};

//病院のみの集計
function meshCount_hosp(feature, layer) {
	var lat_lng = feature.geometry.coordinates;
	var latlng = L.latLng(lat_lng[1], lat_lng[0]);
	var mesh_id = getMeshId(latlng);
	if (!code2count_hosp[mesh_id]) {
		code2count_hosp[mesh_id] = 1;
	}
	else {
		code2count_hosp[mesh_id]++;
	}
};
//======================================================================
// function（共通）
//======================================================================

//レイヤーを選ばないときに、デフォルトの設定に戻します。
function orgStyle(feature) {
	return {
		fillColor: '#3388ff'
	};
}
//色を決める関数
function color(x) {
	return x > 10 ? '#990000' :
		x > 8 ? '#d7301f' :
			x > 6 ? '#ef6548' :
				x > 4 ? '#fc8d59' :
					x > 2 ? '#fdbb84' :
						x > 1 ? '#fdd49e' :
							x > 0 ? '#fee8c8' : '#fff7ec';
}
//
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
			zoom: 12, //ズームを指定
			preferCanvas: true //表示の高速化
		});
	/*
	var map2 = L.map('map2',
		{
			center: latlng, //地図の中心を指定
			zoom: 12, //ズームを指定
			preferCanvas: true //表示の高速化
		});
	*/

	// 頂点の配列を格納（ポリゴン表示）
	// [35.6920, 140.0486]：東邦大学習志野キャンパス
	// [35.6912767, 140.0203289]：JR津田沼駅
	// [35.6672462,140.0128975]：JR新習志野駅
	//var latlngs = [[35.6920, 140.0486], [35.6912767, 140.0203289], [35.6672462,140.0128975]];

	//{s}手段利用可能なサブドメインの1つ（ドメイン制限あたりブラウザ平行要求を支援するために順次使用;サブドメイン値はオプションで指定されている; a、bまたはcデフォルトで、省略することができる）、{z}-ズームレベル、{x}および{y}-タイル座標。{r}URLに「@ 2x」を追加して網膜タイルをロードするために使用できます。テンプレートでカスタムキーを使用できます。これは、次のようにTileLayerオプションから評価されます。
	var titleLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
	titleLayer.addTo(map);
	//titleLayer.addTo(map2);

	// マーカーの表示
	//var coordinate = [35.6920, 140.0486];
	//var marker = L.marker(coordinate).addTo(map);

	// ポップアップの表示
	//marker.bindPopup("Toho University Narashino Campus");

	// 円の表示
	// radiusはメートル単位
	//L.circle([35.6920, 140.0486], {radius: 500}).addTo(map);

	// ポリゴンの表示
	//L.polygon(latlngs, {color: 'red'}).addTo(map);

	// 行政区の表示
	/*
	var GeoJSONLayer_2 = L.geoJson(chiba_areas,
		{
			onEachFeature: myPopup
		});
	GeoJSONLayer_2.addTo(map);
	*/
	//※行政区は常に表示するため、ここでaddToMapをする。

	//人口レイヤー（メッシュ）の表示
	var popLayer = L.geoJson(chiba_base_mesh, {
		onEachFeature: meshPopup
	});
	popLayer.addTo(map);

	// 千葉県の全医療機関の表示
	/*
	var GeoJSONLayer_1 = L.geoJson(med_providers,
		{
			pointToLayer: function (feature, latlng) {
				var name = feature.properties.P04_002; // 名前
				var spec = feature.properties.P04_004; // 専門
				var content = name + ":<br>" + spec; // ポップアップに載せる文
				//var x = L.marker(latlng).bindPopup(content); //マーカーの設定
				var x = L.circleMarker(latlng, {
					radius: 1, //マーカーの直径
					color: '#3388ff'
				}).bindPopup(content);

				//医療機関データから住所を取得。住所からから自治体コードを取得
				var address = feature.properties.P04_003; //自治体コード
				//デバック用
				//console.log(address);
				var code = search_code(address);
				//デバック用
				//console.log(code);

				//自治体コードごとにマーカーを集計
				//全医療機関カウンタ：code2count_all
				if (!code2count_all[code]) {
					//始めて出現した自治体コード
					code2count_all[code] = 1;
				}
				else {
					//既出の自治体コード
					code2count_all[code]++;
				}
				//デバック用
				//console.log(code);
				//console.log(code2count_all[code]);

				return x;
			}
		});
	*/
	//※ボタンを押した際にレイヤーを適用するので、ここでaddTOMapはしない。

	// 千葉県の病院のみの表示
	// filterメソッド：配列の内容を特定の条件で絞り込む。
	/*
	var GeoJSONLayer_3 = L.geoJson(med_providers,
		{
			pointToLayer: function (feature, latlng) {
				var name = feature.properties.P04_002;
				var dep = feature.properties.P04_004;
				var content = name + ":<br>" + dep;
				//var x = L.marker(latlng).bindPopup(content); //マーカーの設定
				var x = L.circleMarker(latlng, {
					radius: 1 , //マーカーの直径
					color: '#3388ff'
				}).bindPopup(content); //サークルマーカーの設定


				//医療機関データから住所を取得。住所からから自治体コードを取得
				var address = feature.properties.P04_003; //自治体コード
				//デバック用
				//console.log(address)
				var code = search_code(address);
				//デバック用
				//console.log(code);

				//自治体コードごとにマーカーを集計
				//病院のみカウンタ：code2count_hosp
				if (!code2count_hosp[code]) {
					//始めて出現した自治体コード
					code2count_hosp[code] = 1;
				}
				else {
					//既出の自治体コード
					code2count_hosp[code]++;
				}

				//デバック用
				//console.log(code);
				//console.log(code2count_hosp[code]);

				return x;
			},
			filter: function (feature) {
				// feature.properties.P04_001
				// ：医療機関区分（病院：1、診療所：2、歯科診療所：3）
				switch (feature.properties.P04_001) {
					case "1": return true;
					default: return false;
				}
			}
		});
		*/
	//※ボタンを押した際にレイヤーを適用するので、ここでaddTOMapはしない。

	//全医療機関のレイヤー
	//myPointはポップアップをつくる、２つのマーカーレイヤーに共通の関数、
	//count_1は数を数える、このレイヤーだけの関数です。
	var medLayer = L.geoJson(med_providers, {
		pointToLayer: meshMyPoint,
		onEachFeature: meshCount_all
	});

	//病院のみのレイヤー
	//count_2は数を数える、このレイヤーだけの関数です。
	var hospLayer = L.geoJson(med_providers, {
		pointToLayer: meshMyPoint,
		onEachFeature: meshCount_hosp,
		filter: onlyHosp
	});

	// 切り替え(leafletの機能)
	/*
	var overlays = 
	{
		"Administrative districts": GeoJSONLayer_2,
		"Hospitals and clinics": GeoJSONLayer_1
	}
	L.control.layers(overlays).addTo(map);
	*/

	// 切り替え(ボタン)
	// on_button：マーカーを表示　off_button：マーカーを削除
	//$("#on_button").on('click', function () { GeoJSONLayer_1.addTo(map); });
	//$("#off_button").on('click', function () { map.removeLayer(GeoJSONLayer_1); });

	// 切り替え（ラジオボタン）
	/*
	$("#select_hosp_1").on('click', function(){
		map.removeLayer(GeoJSONLayer_1);
		GeoJSONLayer_3.addTo(map);
	});
	*/

	// var code2count = [];
	//病院だけのレイヤーを表示
	$("#only_hosp").on('click', function () {

		//病院だけの集計
		code2count = code2count_hosp;

		//全医療機関レイヤーを削除
		//map.removeLayer(GeoJSONLayer_1);
		map.removeLayer(medLayer);

		//病院のみレイヤーの表示
		//GeoJSONLayer_3.addTo(map);
		hospLayer.addTo(map);

		//行政区域レイヤーのポップアップを更新
		//GeoJSONLayer_2.bindPopup(newPopup).setStyle(newStyle_1);
		popLayer.bindPopup(meshNewPopup).setStyle(meshNewStyle_1);
	});
	/*
	$("#select_hosp_2").on('click', function(){
		map.removeLayer(GeoJSONLayer_3);
		GeoJSONLayer_1.addTo(map);
	});
	*/
	//全医療機関のレイヤーを表示
	$("#med_all").on('click', function () {

		//全医療機関の集計
		code2count = code2count_all;

		//病院のみレイヤーを削除
		//map.removeLayer(GeoJSONLayer_3);
		map.removeLayer(hospLayer);

		//全医療機関レイヤーを表示
		//GeoJSONLayer_1.addTo(map);
		medLayer.addTo(map);

		//行政区域レイヤーのポップアップを更新
		//GeoJSONLayer_2.bindPopup(newPopup).setStyle(newStyle_2);
		popLayer.bindPopup(meshNewPopup).setStyle(meshNewStyle_2);
	});
	/*
	$("#select_hosp_3").on('click', function(){
		map.removeLayer(GeoJSONLayer_1);
		map.removeLayer(GeoJSONLayer_3);
	});
	*/
	//すべてのレイヤーを消去、行政区域レイヤーを初期化
	$("#no_med").on('click', function () {

		//集計はなし
		code2count = [];

		//全医療機関レイヤーの削除
		//map.removeLayer(GeoJSONLayer_1);
		map.removeLayer(medLayer);

		//病院のみレイヤーの削除
		//map.removeLayer(GeoJSONLayer_3);
		map.removeLayer(hospLayer);

		//行政区域のポップアップを更新
		//GeoJSONLayer_2.bindPopup(newPopup), setStyle(orgStyle);
		popLayer.bindPopup(meshNewPopup).setStyle(orgStyle);
	});
	//マーカーだけ消去、行政区域レイヤーはそのまま
	$("#off_button").on('click', function () {

		//全医療機関レイヤーの削除
		//map.removeLayer(GeoJSONLayer_1);
		map.removeLayer(medLayer);

		//病院のみレイヤーの削除
		//map.removeLayer(GeoJSONLayer_3);
		map.removeLayer(hospLayer);

	});
	// Do not forget to close the brackets
});