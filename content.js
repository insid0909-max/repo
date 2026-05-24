(function() {
    'use strict';

    // 1단계: Next.js 정적 데이터 영역 확보를 위해 스크립트 태그 검색
    const scripts = document.querySelectorAll('script');
    let dataStream = "";

    scripts.forEach(script => {
        if (script.textContent && script.textContent.includes('self.__next_f.push')) {
            dataStream += script.textContent;
        }
    });

    if (!dataStream) return;

    // 2단계: 이미지 확장자 주소 정밀 추출
    const imgRegex = /https:\/\/[^"'\s\\]+\.(jpg|jpeg|png|webp|gif)/gi;
    const foundImages = dataStream.match(imgRegex) || [];
    const cleanPages = [];

    foundImages.forEach(img => {
        const cleanImgUrl = img.replace(/\\/g, '');
        if (!cleanImgUrl.includes('ad_test') && !cleanImgUrl.includes('pixel') && !cleanPages.includes(cleanImgUrl)) {
            cleanPages.push(cleanImgUrl);
        }
    });

    // 3단계: 기존 안티 애드블록이 걸린 지저분한 화면을 통째로 밀어버리고 순수 만화 뷰어로 대체
    if (cleanPages.length > 0) {
        // 레이아웃 초기화
        document.open();
        document.write(`
            <html>
            <head>
                <title>짭토끼 클린 뷰어</title>
                <style>
                    body { background-color: #121212; margin: 0; text-align: center; }
                    .manga-page { max-width: 100%; display: block; margin: 0 auto; padding: 0; }
                </style>
            </head>
            <body>
                <div id="viewer-root"></div>
            </body>
            </html>
        `);
        document.close();

        // 정화된 이미지들을 순서대로 화면에 배치
        const root = document.getElementById('viewer-root');
        cleanPages.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.className = 'manga-page';
            root.appendChild(img);
        });
    }
})();
