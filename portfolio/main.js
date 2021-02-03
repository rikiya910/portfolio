//fadeIn
$('header').fadeIn(3000).css('display', 'flex');
$('h1').fadeIn(4000);
$('img').fadeIn(4000);


//clickしてscroll
const positionGreet = $("#greet").offset().top;
$('#nav_greet').on('click', (e) => {
  $('html, body').animate({ scrollTop: positionGreet }, 500);
});

const positionWork = $("#work").offset().top;
$('#nav_work').on('click', (e) => {
  $('html, body').animate({ scrollTop: positionWork }, 500);
});

const positionProgram = $("#program").offset().top;
$('#nav_program').on('click', (e) => {
  $('html, body').animate({ scrollTop: positionProgram }, 500);
});

const positionStudy = $("#study").offset().top;
$('#nav_study').on('click', (e) => {
  $('html, body').animate({ scrollTop: positionStudy }, 500);
});

const positionContact = $("#contact").offset().top;
$('#nav_contact').on('click', (e) => {
  $('html, body').animate({ scrollTop: positionContact }, 500);
});


//clickしてcopy
const $copyBtn = $('#copy_btn');
$copyBtn.on('click', (e) => {
  console.log('クリックに成功');
  e.preventDefault();
  // コピーする文章の取得
  const text = $copyBtn.text();
  console.log(text);
  // テキストエリアの作成
  let $textarea = $('<textarea></textarea>');
  // テキストエリアに文章を挿入
  $textarea.text(text);
  //　テキストエリアを挿入
  $copyBtn.append($textarea);
  //　テキストエリアを選択
  $textarea.select();
  document.execCommand('copy');
  // テキストエリアの削除
  $textarea.remove();
  $('#copy_success').fadeIn(200).delay(200).fadeOut(300);
});

//hoverするとCopy表示
$copyBtn.hover(
  function() {
  //マウスカーソルが重なった時の処理
    console.log('hover成功！');
    $('#copy_select').css('display', 'block');
  },
  function() {
  //マウスカーソルが離れた時の処理
    $('#copy_select').css('display', 'none');
  }
);


//waypoint
const $ani = $('.animated');
if (window.matchMedia( '(max-width: 1020px)' ).matches) {
  console.log('スマホ版です。');
  $ani.fadeIn(5000);
} else {
  console.log('スマホ版ではありません。');
  $ani.waypoint({
    handler(direction) {
      if (direction === 'down') {
        $(this.element).addClass('fadeInUp');
        $(this.element).removeClass('fadeOutUp');
      }
    },
    offset: '60%',
  });
  
  $ani.waypoint({
    handler(direction) {
      if (direction === 'up') {
        $(this.element).addClass('fadeOutUp');
        $(this.element).removeClass('fadeInUp');
      }
    },
    offset: '60%',
  });
}

// Topボタンの表示／非表示の切り替え
const $top = $('#top');
const updateButton = () => {
  console.log('Top判定');
  if ($(window).scrollTop() >= 1000) {
    $top.fadeIn();
  } else {
    $top.fadeOut();
  }
};

// スクロールされる度にupdateButtonを実行
$(window).on('scroll', updateButton);

// ボタンをクリックしたらページトップにスクロールする
$top.on('click', (e) => {
  e.preventDefault();
  $('html, body').animate({ scrollTop: 0 }, 500);
});

// ページの途中でリロード（再読み込み）された場合でも、ボタンが表示されるようにする
updateButton();


// Flickr API
// 検索テキストに応じたデータを取得するためのURLを作成して返す
const getRequestURL = (searchText) => {
  const parameters = $.param({
    method: 'flickr.photos.search',
    api_key: '94c434672727485b8aea9d2d4d479b08',
    text: searchText, // 検索テキスト
    sort: 'interestingness-desc', // 興味深さ順
    per_page: 4, // 取得件数
    license: '4', // Creative Commons Attributionのみ
    extras: 'owner_name,license', // 追加で取得する情報
    format: 'json', // レスポンスをJSON形式に
    nojsoncallback: 1, // レスポンスの先頭に関数呼び出しを含めない
  });
  const url = `https://api.flickr.com/services/rest/?${parameters}`;
  return url;
};

// photoオブジェクトから画像のURLを作成して返す
const getFlickrImageURL = (photo, size) => {
  let url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${
    photo.secret
  }`;
  if (size) {
    // サイズ指定ありの場合
    url += `_${size}`;
  }
  url += '.jpg';
  return url;
};

// photoオブジェクトからaltテキストを生成して返す
const getFlickrText = (photo) => {
  let text = `"${photo.title}" by ${photo.ownername}`;
  if (photo.license === '4') {
    // Creative Commons Attribution（CC BY）ライセンス
    text += ' / CC BY';
  }
  return text;
};

new Vue({
  el: '#coffee',
  data: {
    photos: [],
  },
  created() {
    const url = getRequestURL('coffee');
    $.getJSON(url, (data) => {
      if (data.stat !== 'ok') {
        return;
      }
      this.photos = data.photos.photo.map(photo => ({
        id: photo.id,
        imageURL: getFlickrImageURL(photo, 'q'),
        text: getFlickrText(photo),
      }));
    });
  },
});