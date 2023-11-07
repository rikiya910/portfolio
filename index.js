"use strict";
/*-------------------------------------------

    definition
    
--------------------------------------------*/

/*-------------------------------------------
    入力文字変換
--------------------------------------------*/
function encode(data) {
    return data
        .replaceAll(',', 'comma')
        .replaceAll("'", 'single')
        .replaceAll('"', 'dbl');
}


/*-------------------------------------------
    出力文字変換
--------------------------------------------*/
function decode(data) {
    return data
        .replaceAll('comma', ',')
        .replaceAll('single', "'")
        .replaceAll('dbl', '"');
}


/*-------------------------------------------
    fetch時に共通で使うobj
--------------------------------------------*/
function comFetchObj(vals) {
    return {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vals)
    }
}


/*-------------------------------------------
    タイムスタンプ生成
--------------------------------------------*/
function pressTimestamp() {
    const DATE = new Date();
    const FORMAT = 'YYYY-MM-DD hh:mi:ss'; // "2019/10/04 12:34:56" -> "20191004_123456"
    return FORMAT
        .replace(/YYYY/g, String(DATE.getFullYear()))
        .replace(/MM/g, ('0' + (DATE.getMonth() + 1)).slice(-2))
        .replace(/DD/g, ('0' + DATE.getDate()).slice(-2))
        .replace(/hh/g, ('0' + DATE.getHours()).slice(-2))
        .replace(/mi/g, ('0' + DATE.getMinutes()).slice(-2))
        .replace(/ss/g, ('0' + DATE.getSeconds()).slice(-2));
}


/*-------------------------------------------
    共通変数
--------------------------------------------*/
const CONTAINER = document.querySelector('#container');
const SIDE = document.querySelector('#side');
const SIDE_ITEMS = document.querySelector('#side-items');

let cash; // 最初に一気に前までの情報をDBから取得して、この変数に格納

let schFlag; // 検索欄表示中にtrueになる
let schFilterFlag; // 検索で絞り込んでいる時にtrueになる

let hstFlag; // 履歴表示中にtrueになる
let hstId; // 履歴表示中に選択されているitemのunique_id

const EMPTY_TEXT = '[ 未入力 ]'; // タイトルが未入力の時に使用


/*-------------------------------------------
    編集モード
--------------------------------------------*/
function editMode(memo, id) {
    const HEAD = !hstFlag ? 'page' : 'unique'; // 履歴表示中かで使うidを分ける

    // タブ切替
    SIDE_ITEMS.querySelectorAll('li').forEach(item => {
        const ID_EL = item.querySelector(`.${HEAD}-id`);
        ID_EL.textContent == id ? ID_EL.parentNode.classList.add(`selected-${memo}`)
            : item.classList.remove(`selected-${memo}`);
    });

    document.querySelector(`#${memo}`).classList.remove('ban');

    const MEMO_TITLE = document.querySelector(`#${memo}-title`);
    const MEMO_TEXT = document.querySelector(`#${memo}-text`);

    if (!hstFlag) {
        MEMO_TITLE.disabled = false;
        MEMO_TEXT.disabled = false;
    }

    MEMO_TITLE.placeholder = EMPTY_TEXT;

    // 編集用に値の入れ込み
    const EDIT_OBJ = cash.find(obj => {
        if (!hstFlag) { if (!obj.delete_flag && obj.page_id == id) return obj }
        else { if (obj.unique_id == id) return obj }
    });

    if (EDIT_OBJ) {
        MEMO_TITLE.value = decode(EDIT_OBJ.title);
        MEMO_TEXT.value = decode(EDIT_OBJ.text);

        MEMO_TITLE.onkeyup = () => thinOut(); // タイトル入力
        MEMO_TEXT.onkeyup = () => thinOut(); // テキスト入力

        // テキスト入力時の間引き関数
        let actFlag = true;
        function thinOut() {
            const DURATION = 800; // 間引き時間
            sideUpdate(); // 毎回、サイド更新
            if (actFlag) {
                setTimeout(() => {
                    editAct(); // 間引いて、編集実行
                    actFlag = true;
                }, DURATION)
                actFlag = false;
            }
        }

        // サイドタイトル更新
        function sideUpdate() {
            SIDE_ITEMS.querySelectorAll('.page-id')
                .forEach(idEl => {
                    if (idEl.textContent == id) { // 編集idと一致するリストを捜索
                        const TARGET = idEl.parentNode.querySelector('.side-title');
                        TARGET.textContent = MEMO_TITLE.value ? MEMO_TITLE.value : EMPTY_TEXT;
                    }
                });
        }

        // 編集実行
        function editAct() {
            // DB編集
            const TITLE = encode(MEMO_TITLE.value);
            const TEXT = encode(MEMO_TEXT.value);

            // unique_idセット
            const UNIQUE_ID = !cash.length ? 1 : parseInt(cash[0].unique_id) + 1;

            let vals = TITLE
                + ',' + TEXT
                + ',' + id
                + ',' + UNIQUE_ID
                + ',' + pressTimestamp();
            fetch('php/delete.php', comFetchObj(id))
                .then(() => fetch('php/post.php', comFetchObj(vals)));

            // cash編集
            const VAL_ARY = vals.split(',');
            const KEYS = 'title,text,page_id,unique_id,time';
            const KEY_ARY = KEYS.split(',');
            const NEW_OBJ = {}
            KEY_ARY.forEach((key, i) => NEW_OBJ[key] = VAL_ARY[i]);
            NEW_OBJ.delete_flag = false;

            cash.find(obj => { // 編集前を削除済みに変更
                if (!obj.delete_flag && obj.page_id == id) {
                    obj.delete_flag = true;
                    return true;
                }
            })

            cash.unshift(NEW_OBJ);
        }
    }
}


/*-------------------------------------------
    編集解除
--------------------------------------------*/
function cancelEdit(memo) {
    document.querySelector(`#${memo}-title`).value = ''; // titleを空に
    document.querySelector(`#${memo}-text`).value = ''; // textを空に

    SIDE_ITEMS.querySelectorAll('li') // タブ初期化
        .forEach((item) => item.classList.remove(`selected-${memo}`));
}


/*-------------------------------------------
    禁止モード
--------------------------------------------*/
function banMode(memo) {
    cancelEdit(memo);

    document.querySelector(`#${memo}`).classList.add('ban');

    const MEMO_TITLE = document.querySelector(`#${memo}-title`);
    const MEMO_TEXT = document.querySelector(`#${memo}-text`);

    MEMO_TITLE.disabled = true;
    MEMO_TEXT.disabled = true;
    MEMO_TITLE.placeholder = '';
}


/*-------------------------------------------
    履歴モード
--------------------------------------------*/
function restoreMode() {
    hstFlag = true;
    SIDE.classList.add('history');

    // リスト生成
    while (SIDE_ITEMS.firstChild) SIDE_ITEMS.removeChild(SIDE_ITEMS.firstChild); // リストの初期化
    cash.forEach(obj => { if (obj.delete_flag) addItem(obj, 'beforeend') }); // 削除されたobjを抽出

    banMode('easy');
    banMode('hard');
}


/*-------------------------------------------
    履歴解除
--------------------------------------------*/
function cancelRestore() {
    hstFlag = false;
    SIDE.classList.remove('history');
    hstId = '';

    defaultItems(); // リスト生成
}


/*-------------------------------------------
    リスト単体生成
--------------------------------------------*/
function addItem(obj, pos) {
    const TITLE = obj.title ? decode(obj.title) : EMPTY_TEXT;
    const SHORT = obj.time.substring(5, 16); // 秒以下はカット

    /*-------------------------------------------
        要素作成
    --------------------------------------------*/
    let html = '<li>'
    if (hstFlag) html += `<span style="display: none" class="unique-id">${obj.unique_id}</span>`;
    html += `<span style="display: none" class="page-id">${obj.page_id}</span><span class="side-title">${TITLE}</span>`;
    if (hstFlag) html += `<br><time class="side-time">${SHORT}</time>`;
    html += '<a href="javascript:;" class="icon ';
    html += !hstFlag ? 'delete' : 'restore';
    html += '"></a></li>';
    SIDE_ITEMS.insertAdjacentHTML(pos, html);

    let target;
    switch (pos) { // 追加した要素を取得
        case 'beforeend': target = SIDE_ITEMS.querySelector('li:last-of-type'); break;
        case 'afterbegin': target = SIDE_ITEMS.querySelector('li:first-of-type'); break;
    }

    const DBL_DURATION = 500; // ダブルクリック時のスパン

    /*-------------------------------------------
        リストクリック
    --------------------------------------------*/
    (function () {
        let once; // 一回のみクリックされたときはtrueになる
        const HEAD = !hstFlag ? 'page' : 'unique'; // 履歴表示中かで使うidを分ける

        // シングルクリックでeasyを編集
        target.onclick = () => {
            once = true;

            setTimeout(() => {
                if (once) multiplePrevent(() => com('easy'));
            }, DBL_DURATION)
        }

        // ダブルクリックでhardを編集
        target.ondblclick = () => {
            once = false;

            multiplePrevent(() => {
                if (!hstFlag && CONTAINER.classList.contains('split')) com('hard')
                else if (hstFlag) alert('履歴表示中は右側の使用不可');
            });
        }

        // 同時選択させないための関数
        function multiplePrevent(callback) {
            if (target.classList.contains('selected-easy') || target.classList.contains('selected-hard')) alert('同時選択はできません')
            else callback();
        }

        function com(memo) {
            const ID = target.querySelector(`.${HEAD}-id`).textContent;
            if (!hstFlag) localStorage.setItem(memo, ID)
            else hstId = ID;
            editMode(memo, ID);
        }
    })();


    /*-------------------------------------------
        アイコンクリック
    --------------------------------------------*/
    (function () {
        /*-------------------------------------------
            削除（ゴミ箱）クリック
        --------------------------------------------*/
        if (!hstFlag) {
            iconClick('delete', pageId => {
                fetch('php/delete.php', comFetchObj(pageId)) // DBから削除

                target.remove(); // 項目を削除

                // selected-?要素を削除した場合は禁止モードに切替
                function banJudge(mode) {
                    if (target.classList.contains(`selected-${mode}`)) {
                        banMode(mode);
                        localStorage.setItem(mode, ''); // local初期化
                    }
                }

                banJudge('easy');
                banJudge('hard');
            });
        }

        /*-------------------------------------------
            復元（開きゴミ箱）クリック
        --------------------------------------------*/
        else {
            iconClick('restore', pageId => {
                const UNIQUE_ID = target.querySelector('.unique-id').textContent;

                cash.find(obj => { // cashから復元
                    if (obj.unique_id == UNIQUE_ID) {
                        obj.delete_flag = false;
                        return true;
                    }
                });

                fetch('php/delete.php', comFetchObj(pageId))
                    .then(() => fetch('php/restore.php', comFetchObj(UNIQUE_ID))); // DBから復元

                while (SIDE_ITEMS.firstChild) SIDE_ITEMS.removeChild(SIDE_ITEMS.firstChild); // リストの初期化

                localStorage.setItem('easy', pageId); // idセット

                cancelRestore(); // 普通のリストを表示

                if (schFlag) {
                    SIDE.classList.remove('search');
                    schFlag = false;
                }
            });
        }

        function iconClick(cls, callback) {
            const ICON = target.querySelector(`.${cls}`);

            let once; // 一回のみクリックされたときはtrueになる

            ICON.onclick = e => {
                once = true;
                e.stopPropagation(); // バブリング阻止

                setTimeout(() => {
                    const TEXT = cls == 'delete' ? '削除' : '復元';
                    if (once) alert(`ゴミ箱をダブルクリックで${TEXT}`);
                }, DBL_DURATION)
            };

            ICON.ondblclick = e => {
                once = false;
                e.stopPropagation(); // バブリング阻止

                const PAGE_ID = target.querySelector('.page-id').textContent;

                cash.find(obj => { // cashから削除
                    if (!obj.delete_flag && obj.page_id == PAGE_ID) {
                        obj.delete_flag = true;
                        return true;
                    }
                });

                callback(PAGE_ID);
            };
        }
    })();
}


/*-------------------------------------------
    初期リスト一括生成
--------------------------------------------*/
function defaultItems() {
    while (SIDE_ITEMS.firstChild) SIDE_ITEMS.removeChild(SIDE_ITEMS.firstChild); // リストの初期化

    const NOT_DELETES = cash.filter(obj => { if (!obj.delete_flag) return obj }); // 削除されていないobjを抽出
    NOT_DELETES.sort((obj1, obj2) => obj2.page_id - obj1.page_id); // unique_id大きい順からpage_id大きい順に変更
    NOT_DELETES.forEach(obj => { addItem(obj, 'beforeend') });

    backLocal();
}


/*-------------------------------------------
   localStorageから再生
--------------------------------------------*/
function backLocal() {
    const EASY_ID = localStorage.getItem('easy');
    if (EASY_ID) editMode('easy', EASY_ID);

    const HARD_ID = localStorage.getItem('hard');
    if (HARD_ID) editMode('hard', HARD_ID);
}



/*-------------------------------------------

    main

--------------------------------------------*/
fetch('php/parge.php', comFetchObj()) // 一定期間より前の履歴を削除するファイル
    .then(() => fetch('php/get.php', comFetchObj()) // DB取得
        .then(response => response.json())
        .then(json => {

            /*-------------------------------------------
                cash再生
            --------------------------------------------*/
            if (json.length != null) {
                cash = json.filter(obj => {
                    // 空欄削除
                    for (const KEY in obj) { if (obj[KEY]) obj[KEY] = obj[KEY].toString().replace(/\s+$/, "") }
                    return obj;
                })
                console.log('cash', cash);
            }

            defaultItems(); // 最初の実行

            // 分割状態も再生
            if (Boolean(parseInt(localStorage.getItem('split')))) CONTAINER.classList.add('split');


            /*-------------------------------------------
                分割ボタン
            --------------------------------------------*/
            document.querySelector('#side-split').onclick = () => {
                banMode('hard');
                localStorage.setItem('hard', ''); // local初期化
                CONTAINER.classList.toggle('split');
                localStorage.setItem('split', Number(CONTAINER.classList.contains('split')));
            }


            /*-------------------------------------------
                検索ボタン
            --------------------------------------------*/
            // 検索ボタン
            document.querySelector('#side-search').onclick = () => {
                if (!schFlag) {
                    SIDE.classList.add('search');
                    schFlag = true;
                } else {
                    SIDE.classList.remove('search');
                    schFlag = false;

                    if (schFilterFlag) { // リスト生成
                        if (!hstFlag) defaultItems()
                        else restoreMode();
                    }
                }
            }

            // 検索ボックスの機能
            const INPUT = document.querySelector('#search-block input')
            INPUT.onkeyup = () => {
                while (SIDE_ITEMS.firstChild) SIDE_ITEMS.removeChild(SIDE_ITEMS.firstChild); // リストの初期化
                schFilterFlag = INPUT.value ? true : false;

                // 履歴表示中かで分岐させ、タイトルかテキストがヒットしたものを表示
                if (!hstFlag) { // 通常リスト表示時
                    const HITS = cash.filter(obj => {
                        if (!obj.delete_flag && (obj.title.includes(INPUT.value) || obj.text.includes(INPUT.value))) return obj
                    }); // 削除されていないobjを抽出

                    HITS.sort((obj1, obj2) => obj2.page_id - obj1.page_id); // page_id順に並び替え
                    HITS.forEach(obj => { addItem(obj, 'beforeend') });

                    backLocal();
                } else { // 履歴リスト表示時
                    cash.forEach(obj => {
                        if (obj.delete_flag && (obj.title.includes(INPUT.value) || obj.text.includes(INPUT.value))) addItem(obj, 'beforeend');
                    }); // 削除されているobjを抽出

                    if (hstId) editMode('easy', hstId);
                }
            }


            /*-------------------------------------------
                履歴ボタン
            --------------------------------------------*/
            document.querySelector('#side-history')
                .onclick = () => !hstFlag ? restoreMode() : cancelRestore();


            /*-------------------------------------------
                新規ボタン
            --------------------------------------------*/
            document.querySelector('#side-new').onclick = () => {
                cancelEdit('easy');

                let id;
                if (!cash.length) id = 1
                else { // 非破壊にするためスプレット構文
                    const ORDERED = [...cash].sort((obj1, obj2) => obj2.page_id - obj1.page_id);
                    console.log(cash);
                    console.log(ORDERED);
                    id = parseInt(ORDERED[0].page_id) + 1;
                }
                
                localStorage.setItem('easy', id);

                // unique_idセット
                const UNIQUE_ID = !cash.length ? 1 : parseInt(cash[0].unique_id) + 1;

                // DB作成
                const TITLE = encode(document.querySelector('#easy-title').value);
                const TEXT = encode(document.querySelector('#easy-text').value);
                let vals = TITLE
                    + ',' + TEXT
                    + ',' + id
                    + ',' + UNIQUE_ID
                    + ',' + pressTimestamp();
                    console.log(vals);
                fetch('php/post.php', comFetchObj(vals));

                // cash作成
                const VAL_ARY = vals.split(',');
                const KEYS = 'title,text,page_id,unique_id,time';
                const KEY_ARY = KEYS.split(',');
                const NEW_OBJ = {}
                KEY_ARY.forEach((key, i) => NEW_OBJ[key] = VAL_ARY[i]);
                NEW_OBJ.delete_flag = false;

                cash.unshift(NEW_OBJ);

                addItem(NEW_OBJ, 'afterbegin'); // sideに追加

                editMode('easy', NEW_OBJ.page_id);
            };


            /*-------------------------------------------
                順番入替ボタン            
            --------------------------------------------*/
            (function () {
                // 順番アップクリック
                document.querySelector('#side-up').onclick = () => {
                    const FROM_EL = SIDE_ITEMS.querySelector('.selected-easy');
                    const TO_EL = FROM_EL.previousElementSibling; // 直前要素
                    if (TO_EL) {
                        SIDE_ITEMS.insertBefore(FROM_EL, TO_EL); // タブ位置入替
                        chgOrder(FROM_EL, TO_EL);
                    }
                }

                // 順番ダウンクリック
                document.querySelector('#side-down').onclick = () => {
                    const FROM_EL = SIDE_ITEMS.querySelector('.selected-easy');
                    const TO_EL = FROM_EL.nextElementSibling; // 直後要素
                    if (TO_EL) {
                        SIDE_ITEMS.insertBefore(TO_EL, FROM_EL); // タブ位置入替
                        chgOrder(FROM_EL, TO_EL);
                    }
                }

                function chgOrder(FROM_EL, TO_EL) {
                    const FROM_EL_IdEl = FROM_EL.querySelector('.page-id');
                    const FROM_EL_Id = FROM_EL_IdEl.textContent;
                    const TO_EL_IdEl = TO_EL.querySelector('.page-id');
                    const TO_EL_Id = TO_EL_IdEl.textContent;

                    // idセット
                    localStorage.setItem('easy', TO_EL_Id);

                    // 入替先がhardで編集中であれば、そちらもidセット
                    const HARD_El_Id = SIDE_ITEMS.querySelector('.selected-hard .page-id');
                    if (HARD_El_Id && TO_EL_Id == HARD_El_Id.textContent)
                        localStorage.setItem('hard', FROM_EL_Id);

                    // タブ内のid入替
                    FROM_EL_IdEl.textContent = TO_EL_Id;
                    TO_EL_IdEl.textContent = FROM_EL_Id;

                    // cash削除済みのものまで更新
                    cash.forEach(obj => { if (obj.page_id == FROM_EL_Id) obj.page_id = TO_EL_Id });
                    cash.forEach(obj => { if (obj.page_id == TO_EL_Id) obj.page_id = FROM_EL_Id });

                    // DB更新 
                    const VALS = FROM_EL_Id + ',' + TO_EL_Id;
                    fetch('php/edit-order.php', comFetchObj(VALS));
                }
            })();
        }))