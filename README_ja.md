# plainCanvas

　Adobe Illustrator (CC 2014-) 用の add-on です。以下のことが可能です。

* [paper.js](http://paperjs.org) 用に書かれた JavaScript ファイルを読み込んで実行する。  
（初期状態では、ドラッグで線を描くツールが使用できます。）
* add-on パネル上に作成した画像を、アートボードに書き出す。
* アートボード上のパスを、add-on パネル上に取り込む。

![image of the panel](https://github.com/shspage/plainCanvas/raw/master/image/desc_plaincanvas.png "image of the panel")

### 導入方法
　諸々のスクリプトを読み込んで実行するという性格上、デバッグ機能を利用することを想定しています。このため、導入には通常のadd-onと異なる手順が必要です。    

1. [CEP 10 HTML Extension Cookbook](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_10.x/Documentation/CEP%2010.0%20HTML%20Extension%20Cookbook.md#cep-10-html-extension-cookbook) の [Debugging Unsigned Extensions](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_10.x/Documentation/CEP%2010.0%20HTML%20Extension%20Cookbook.md#debugging-unsigned-extensions) にしたがって、debug mode flagを設定してください。(CSXS.10とありますが、数字はイラレのバージョンにより異なります。例えば Ai 2024(28.2)では CSXS.11 です。)  
2. [CEP 10 HTML Extension Cookbook](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_10.x/Documentation/CEP%2010.0%20HTML%20Extension%20Cookbook.md#cep-10-html-extension-cookbook) の [Extension Folders](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_10.x/Documentation/CEP%2010.0%20HTML%20Extension%20Cookbook.md#extension-folders) にしたがって、com.shspage.csxs.plaincanvas フォルダを、extensions フォルダに置いてください。  
3. Illustrator を実行して、メニューの ウィンドウ -&#62; エクステンション の中にある plainCanvas を選んでください。

### パネル上のボタンについて
* __in__ : Illustratorで選択されているパスが、パネル上に取り込まれます。
* __out__ : パネル上のパスが、アートボードに書き出されます。
* __run__ : 実行機能があるスクリプトを実行します。
* __opt__ : オプション入力欄を表示／非表示します。入力できるオプションがない場合、no option と表示されます。
* __&#60;__ : 直前の描画を取り消します。
* __&#62;__ : 直前に取り消した描画をやり直します。
* __CL__ : パネル上の描画をクリアします。
* __DB__ : 既定のブラウザでデバッグツールを開きます。
* __RL__ : パネルをリロードします。( hostscript.jsx はリロードされません。)
* __load__ : スクリプトファイルを選択するダイアログを表示します。

### スクリプトファイルの読み込み
* 読み込みたいスクリプトファイルを、パネルへドラッグ＆ドロップしてください。  
__load__ ボタンでスクリプトファイルを選択することもできます。
* 読み込み完了後、パネル上の描画はクリアされます。

### 読み込んで実行できる JavaScript スクリプト
* [scripts](https://github.com/shspage/plainCanvas/tree/master/scripts) フォルダにサンプルスクリプトがあります。
* javascript として記述してください (paperscript ではなく)。詳しくは、http://paperjs.org の、チュートリアル "[Using JavaScript Directly](http://paperjs.org/tutorials/getting-started/using-javascript-directly/)" をご覧下さい。  
　　__例：__ new Path() -> new paper.Path()  // または "with(paper){" ステートメントを使うなど  
　　__例：__ point1 + point2 -> point1.add(point2)  
　　__例：__ function onMouseDown(event) -> tool.onMouseDown = function(event)  
* 文字コードは utf-8 で作成してください。（js/main.js 内の SCRIPT_ENCODING で変更することもできます。変更した場合は、index.htmlのcharset も変更してください。）
* パネルのオプション入力欄を利用する場合、または、 オプション入力欄を非表示にする場合、optionManager.js のメソッドが利用できます。使用方法については同ファイル内の説明やサンプルスクリプトをご覧下さい。
* object の描画が完了した時点で以下を実行すると、undo/redoの対象にできます。("object" は描画したオブジェクトを示す変数に置き換えてください。）
```javascript
undoManager.keep(object);
```
undo は、対象にしたオブジェクトを不可視にすることで行われるため、paper.project 上には存在したままです。ただし、undoManager.js の UNDO_LIMIT を超えた場合は古いものから削除されます。また、不可視オブジェクトは書き出されません。
* 読み込んだスクリプトファイルは、index.html 内に新たに生成した script タグの内容として挿入されます。


### 色の扱い
* canvas は CMYKカラーを扱えないため、CMYKカラーを取り込んだ場合はRGBに変換して表示します。このため、元の色と違って見える場合があります。元のCMYKの値はメモリに保持しており(*1)、書き出す際には元の色になります。  
(*1: js/main.js の ALWAYS_EXPORT_RGB が false の場合)
* js/main.js の ALWAYS_EXPORT_RGB が true の場合、paper.Color.type == "gray" の色は RGBColor で書き出されます。
* 取り込み／書き出しの処理は、グラデーション、特色 に対応していません。

### アートボードへの書き出し
* canvas 上の paper.Path インスタンスの、以下の属性が書き出されます。  
_segments, strokeWidth, strokeColor, fillColor, opacity_

### パスの取り込み
* アートボード上の選択範囲に含まれる PathItem の以下の属性が取り込まれます。  
_pathPoints, strokeWidth, strokeColor, fillColor_
* グループと複合パスは解除された状態で取り込まれます。

### 画像の読み込み
* パネルへのドラッグ＆ドロップ、または__load__ ボタンによって画像を読み込むことができます。対応画像形式は jpeg, png です。
* 画像読み込み後にパネル右上に表示される[hide image]をクリックすると画像を非表示にできます。再度クリックすると表示します。
* 読み込んだ画像は __paper.project.activeLayer.data.raster__ に保持され、スクリプトで利用することができます。
* 画像は、スクリプトファイルの読み込みや CL・RLボタンによる画面クリアの際に破棄されます。

### 変更履歴
#### v.1.2.2
* 画像読み込みに対応。
#### v.1.2.1
* スクリプト読み込みエラー アラートと実行エラー アラートを追加しました。
#### v.1.2.0
* ライブラリ類を更新。
#### v.1.1.8
* runボタンを追加。runボタン用のサンプルスクリプトを追加。
* 修正：前回と同じ名前のスクリプトファイルを読み込んだ際に、変更が反映されます。
#### v.1.1.7
* loadボタンでもスクリプトファイルを読み込めるようにしました。
#### v.1.1.6
* manifest.xml で対応バージョンの上限を 99.9 に変更
#### v.1.1.4
* manifest.xml で対応バージョンの上限を 24.9 に変更
#### v.1.1.3
* グレーカラーのインポート/エクスポートでの問題を修正
#### v.1.1.2
* loadボタンを廃止し、スクリプトファイルのドロップを常に受け付けるようにしました。
* paper.js の基本オブジェクトをグローバルにしました。これに合わせてサンプルスクリプトも更新しました。
* パネルの最大サイズを2000×2000に拡大しました。
#### v.1.1.1
* 読み込み時以外、パネルへのドロップを受け付けないようにしました。
#### v.1.1.0
* パネル上のドラッグでテキストが選択されないようにしました。
* スクリプトファイルをドラッグ＆ドロップで読み込むようにしました。

### TODO / 既知の問題
* TODO: 外部スクリプトファイルの読み込み方法を再検討する。
* アートボードから取り込んだ図形の白黒が反転する場合がある。
* 書き出した際に、アートボードから取り込んだものとcanvas上で描画したものの前後関係が正しくない場合がある。
* TODO: アートボードとのやりとりに importSVG, exportSVG を使う？

### ライセンス、その他
* ※ 改変して公開する場合は、必ず __バンドルID__ を変更してください。（バンドルID … CSXS/manifest.xml および.debug 内の com.shspage.csxs.plaincanvas。）
* MIT ライセンスの下で公開しています。詳細はLICENSE.txtをご覧下さい。
ただし、以下の使用ライブラリは、それぞれのライセンスに従います。

* Paper.js v0.12.17 - The Swiss Army Knife of Vector Graphics Scripting.  
http://paperjs.org/  
Copyright (c) 2011 - 2020, Jürg Lehni & Jonathan Puckey
http://juerglehni.com/ & https://puckey.studio/
All rights reserved.  

* Creative Cloud Extension Builder for Brackets  
https://github.com/davidderaedt/CC-Extension-Builder-for-Brackets  
Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.  

