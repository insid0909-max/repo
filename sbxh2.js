class Sbxh2 {
    constructor() {
        this.name = "짭토끼 전용 소스";
        this.baseUrl = "https://sbxh2.com";
        this.lang = "ko";
    }

    /**
     * [1] 인기/랭킹 목록 파싱
     * 표준 규격 명세에 맞춘 메서드 구조입니다.
     */
    async getPopularManga(page) {
        const url = `${this.baseUrl}/?page=${page}`;
        const response = await http.get(url, {
            headers: { 
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36", 
                "Referer": this.baseUrl 
            }
        });
        const html = response.body;
        const mangaList = [];

        // 정규식 매칭 루프 안정화
        const listRegex = /"title":"([^"]+)","url":"([^"]+)","thumbnail":"([^"]+)"/g;
        const matches = html.matchAll(listRegex);

        for (const match of matches) {
            mangaList.push({
                title: match[1],
                url: match[2],
                thumbnail: match[3].replace(/\\/g, '') // 이스케이프 주소 정화
            });
        }

        return {
            manga: mangaList,
            hasNextPage: mangaList.length > 0
        };
    }

    /**
     * [2] 만화 상세 정보 및 에피소드 회차 목록 파싱
     */
    async getMangaDetails(mangaUrl) {
        const response = await http.get(this.baseUrl + mangaUrl, {
            headers: { 
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36", 
                "Referer": this.baseUrl 
            }
        });
        const html = response.body;
        const chapters = [];

        const chapterRegex = /"chapterName":"([^"]+)","viewerUrl":"([^"]+)"/g;
        const matches = html.matchAll(chapterRegex);

        for (const match of matches) {
            chapters.push({
                name: match[1],
                url: match[2]
            });
        }

        return {
            manga: {
                title: "짭토끼 웹툰",
                description: "자동 파싱 전용 채널"
            },
            chapters: chapters.reverse() // 최신화 상단 배치
        };
    }

    /**
     * [3] 🎯 핵심: 뷰어 이미지 주소 정밀 추출 (Next.js 하이드레이션 가로채기)
     * 명세서상 메서드 이름은 반드시 'getChapterImageList' 또는 'getPageList' 인터페이스를 준수해야 합니다.
     */
    async getChapterImageList(chapterUrl) {
        const response = await http.get(this.baseUrl + chapterUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
                "Referer": this.baseUrl + chapterUrl
            }
        });
        const html = response.body;
        const pages = [];

        // 1단계: Next.js 데이터 청크 추출
        const nextDataMatch = html.match(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/);
        
        if (nextDataMatch) {
            const dataStream = nextDataMatch[1];
            
            // 2단계: 이미지 확장자 주소 정밀 추출
            const imgRegex = /https:\/\/[^"'\s\\]+\.(jpg|jpeg|png|webp|gif)/gi;
            const foundImages = dataStream.match(imgRegex) || [];

            foundImages.forEach((img) => {
                const cleanImgUrl = img.replace(/\\/g, '');

                // 광고 트랩 이미지 필터링
                if (!cleanImgUrl.includes('ad_test') && 
                    !cleanImgUrl.includes('pixel') && 
                    !pages.some(p => p.url === cleanImgUrl)) {
                    
                    pages.push({
                        index: pages.length,
                        url: cleanImgUrl
                    });
                }
            });
        }

        return pages;
    }
}

// [🔥 최종 교정] 코믹쿠 전용 엔진이 소스를 로드하는 절대 규칙
// 익스텐션 인스턴스를 반드시 전역 변수 'ext'에 직접 할당해야만 검증을 통과합니다.
const ext = new Sbxh2();
