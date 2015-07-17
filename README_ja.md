#plainCanvas

　Adobe Illustrator (CC 2014, 2015) 用の add-on です。以下のことが可能です。

* [paper.js] 用に書かれた JavaScript ファイルを読み込んで実行する。  
（初期状態では、ドラッグで線を描くツールが使用できます。）
* add-on パネル上に作成した画像を、アートボードに書き出す。
* アートボード上のパスを、add-on パネル上に取り込む。
[paper.js]:http://paperjs.org

![image of the panel](https://github.com/shspage/plainCanvas/raw/master/image/desc_plaincanvas.png "image of the panel")

###導入方法
　諸々のスクリプトを読み込んで実行するという性格上、デバッグ機能を利用することを想定しています。このため、導入には通常のadd-onと異なる手順が必要です。    

1. [CC14_Extension_SDK.pdf] の10頁にしたがって、debug mode flagを設定してください。  
2. [CC14_Extension_SDK.pdf] の5頁（Extension management の節にしたがって、com.shspage.csxs.plaincanvas フォルダを、extensions フォルダに置いてください。  

[CC14_Extension_SDK.pdf]:http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/creativesuite/pdfs/CC14_Extension_SDK.pdf

###パネル上のボタンについて
* __in__ : Illustratorで選択されているパスが、パネル上に取り込まれます。
* __out__ : パネル上のパスが、アートボードに書き出されます。
* __opt__ : オプション入力欄を表示／非表示します。入力できるオプションがない場合、no option と表示されます。
* __&#60;__ : 直前の描画を取り消します。
* __&#62;__ : 直前に取り消した描画をやり直します。
* __CL__ : パネル上の描画をクリアします。
* __DB__ : 既定のブラウザでデバッグツールを開きます。
* __RL__ : パネルをリロードします。( hostscript.jsx はリロードされません。)
* __select__ : パネル上の描画をクリアして、スクリプトファイルを読み込みます。

###読み込んで実行できる JavaScript スクリプト
* javascript として記述してください (paperscript ではなく)。詳しくは、http://paperjs.org の、チュートリアル "[Using JavaScript Directly]" をご覧下さい。  
　　__例：__ new Path() -> new paper.Path()  
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
[Using JavaScript Directly]:http://paperjs.org/tutorials/getting-started/using-javascript-directly/

###色の扱い
* canvas は CMYKカラーを扱えないため、CMYKカラーを取り込んだ場合はRGBに変換して表示します。このため、元の色と違って見える場合があります。元のCMYKの値はメモリに保持しており(*1)、書き出す際には元の色になります。  
(*1: js/main.js の ALWAYS_EXPORT_RGB が false の場合)
* js/main.js の ALWAYS_EXPORT_RGB が true の場合、paper.Color.type == "gray" の色は RGBColor で書き出されます。
* 取り込み／書き出しの処理は、グラデーション、特色 に対応していません。

###アートボードへの書き出し
* canvas 上の paper.Path インスタンスの、以下の属性が書き出されます。  
_segments, strokeWidth, strokeColor, fillColor, opacity_

###パスの取り込み
* アートボード上の選択範囲に含まれる PathItem の以下の属性が取り込まれます。  
_pathPoints, strokeWidth, strokeColor, fillColor_
* グループと複合パスは解除された状態で取り込まれます。

###ライセンス、その他
* ※ 改変して公開する場合は、必ずバンドルID を変更してください。（バンドルID … CSXS/manifest.xml および.debug 内の com.shspage.csxs.plaincanvas。）
* MIT ライセンスの下で公開しています。詳細はLICENSE.txtをご覧下さい。
ただし、以下の使用ライブラリは、それぞれのライセンスに従います。

* Paper.js v0.9.23 - The Swiss Army Knife of Vector Graphics Scripting.  
http://paperjs.org/  
Copyright (c) 2011 - 2014, Juerg Lehni & Jonathan Puckey  
http://scratchdisk.com/ & http://jonathanpuckey.com/  
All rights reserved.  

* Creative Cloud Extension Builder for Brackets  
https://github.com/davidderaedt/CC-Extension-Builder-for-Brackets  
Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.  

