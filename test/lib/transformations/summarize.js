"use strict";

/* eslint-disable max-len */

const assert = require('./../../utils/assert.js');
const summarize = require('./../../../lib/transformations/summarize');

describe('summarize', () => {
    it('matches the spec', () => {
        const testCases = [
            // Should flatten empty nodes
            [
                '<span></span><b></b><i></i><p><span>f</span></p>',
                '<p><span>f</span></p>'
            ],
            // Should flatten links
            [
                'This is some content with <a href="#"">a link</a>.',
                'This is some content with <span>a link</span>.'
            ],
            // Should strip .noexcerpts
            [
                'This summary should be nice and clean<span class="noexcerpts"> (noexcerpts will be omitted)</span>.',
                'This summary should be nice and clean.'
            ],
            // sup elements are retained
            [
                '<p>A <b>googolplex</b> is the number 10<sup>googol</sup>, or equivalently, 10<sup>(10<sup>100</sup>)</sup>.</p>',
                '<p>A <b>googolplex</b> is the number 10<sup>googol</sup>, or equivalently, 10<sup>(10<sup>100</sup>)</sup>.</p>'
            ],
            // references are stripped
            [
                '<p><b>France</b> is a country with territory status in western Europe and several overseas regions and territories.<span class=\"mw-ref\" id=\"cite_ref-twelve_21-0\"><a href=\"#cite_note-twelve-21\" <span class=\"mw-reflink-text\">[upper-roman 13]</span></a></p>',
                '<p><b>France</b> is a country with territory status in western Europe and several overseas regions and territories.</p>'
            ],
            // math tags are stripped but any math images are shown
            [
                '<p>The Planck–Einstein relation connects the particulate photon energy <span class=\"texhtml \"><i>E</i></span> with its associated wave frequency <span class=\"texhtml \"><i>f</i></span>:</p>\n\n<dl id=\"mwmQ\"><dd id=\"mwmg\"><span class=\"mwe-math-element\"><span class=\"mwe-math-mathml-inline mwe-math-mathml-a11y\" style=\"display: none;\"><math xmlns=\"http://www.w3.org/1998/Math/MathML\">\n  <semantics>\n    <mrow class=\"MJX-TeXAtom-ORD\">\n      <mstyle displaystyle=\"true\" scriptlevel=\"0\">\n        <mi>E</mi>\n        <mo>=</mo>\n        <mi>h</mi>\n        <mi>f</mi>\n      </mstyle>\n    </mrow>\n    <annotation encoding=\"application/x-tex\">{\\displaystyle E=hf}</annotation>\n  </semantics>\n</math></span><img src=\"https://wikimedia.org/api/rest_v1/media/math/render/svg/f39fac3593bb1e2dec0282c112c4dff7a99007f6\" class=\"mwe-math-fallback-image-inline\" aria-hidden=\"true\" style=\"vertical-align: -0.671ex; width:7.533ex; height:2.509ex;\"></span></dd></dl>',
                '<p>The Planck–Einstein relation connects the particulate photon energy <span class=\"texhtml \"><i>E</i></span> with its associated wave frequency <span class=\"texhtml \"><i>f</i></span>:</p>\n\n<dl id=\"mwmQ\"><dd id=\"mwmg\"><span class=\"mwe-math-element\"><img src=\"https://wikimedia.org/api/rest_v1/media/math/render/svg/f39fac3593bb1e2dec0282c112c4dff7a99007f6\" class=\"mwe-math-fallback-image-inline\" aria-hidden=\"true\" style=\"vertical-align: -0.671ex; width:7.533ex; height:2.509ex;\"></span></dd></dl>'
            ],
            // Any content in parentheticals is stripped and no double spaces are left in the output
            [
                '<p><b>Epistemology</b> (<span class="nowrap"><span class="IPA nopopups noexcerpt"><span>/<span style="border-bottom:1px dotted"><span title="/ɪ/ or /ə/ \'e\' in \'roses\'">ᵻ</span><span title="/ˌ/ secondary stress follows">ˌ</span><span title="\'p\' in \'pie\'">p</span><span title="/ɪ/ short \'i\' in \'bid\'">ɪ</span><span title="\'s\' in \'sigh\'">s</span><span title="\'t\' in \'tie\'">t</span><span title="/ɪ/ or /ə/ \'e\' in \'roses\'">ᵻ</span><span title="/ˈ/ primary stress follows">ˈ</span><span title="\'m\' in \'my\'">m</span><span title="/ɒ/ short \'o\' in \'body\'">ɒ</span><span title="\'l\' in \'lie\'">l</span><span title="/ə/ \'a\' in \'about\'">ə</span><span title="/dʒ/ \'j\' in \'jam\'">dʒ</span><span title="/i/ \'y\' in \'happy\'">i</span></span>/</span></span><small class="nowrap metadata">&nbsp;(<span class="unicode haudio"><span class="fn"><span style="white-space:nowrap"><span><img alt="About this sound" src="//upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Loudspeaker.svg/11px-Loudspeaker.svg.png" width="11" height="11" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Loudspeaker.svg/17px-Loudspeaker.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Loudspeaker.svg/22px-Loudspeaker.svg.png 2x" data-file-width="20" data-file-height="20"></span>&nbsp;</span><span>listen</span></span></span>)</small></span>; from <span>Greek</span> <span lang="gre" xml:lang="gre"><span >ἐπιστήμη</span><i>, epistēmē</i></span>, meaning \'knowledge\', and <span lang="" xml:lang=""><span>λόγος</span><i>, <span>logos</span></i></span>, meaning \'logical discourse\') is the <span>branch</span> of <span>philosophy</span> concerned with the theory of <span>knowledge</span>.</p>',
                '<p><b>Epistemology</b> is the <span>branch</span> of <span>philosophy</span> concerned with the theory of <span>knowledge</span>.</p>',
            ],
            // Even birth and death dates inside parentheticals are stripped
            [
                'William Shakespeare (/ˈʃeɪkspɪər/;[1] 26 April 1564 (baptised) – 23 April 1616) was an English poet, playwright, and actor, widely regarded as the greatest writer in the English language and the world\'s pre-eminent dramatist. He is often called England\'s national poet, and the "Bard of Avon". His extant works, including collaborations, consist of approximately 38 plays, 154 sonnets, two long narrative poems, and a few other verses, some of uncertain authorship. His plays have been translated into every major living language and are performed more often than those of any other playwright.',
                'William Shakespeare was an English poet, playwright, and actor, widely regarded as the greatest writer in the English language and the world\'s pre-eminent dramatist. He is often called England\'s national poet, and the "Bard of Avon". His extant works, including collaborations, consist of approximately 38 plays, 154 sonnets, two long narrative poems, and a few other verses, some of uncertain authorship. His plays have been translated into every major living language and are performed more often than those of any other playwright.',
            ],
            // When parentheticals contain '*' symbols they are still stripped
            [
                'Marek Eben (* 18. prosince 1957 Praha) je český herec, moderátor, hudební skladatel, písničkář a zpěvák.',
                'Marek Eben je český herec, moderátor, hudební skladatel, písničkář a zpěvák.',
            ],
            // Content inside Chinese parentheticals are also stripped
            [
                '<p><b>台北101</b>（<b>TAIPEI 101</b>）是位於的，樓高509.2米（1,671英尺），樓層共有101層、另有5層，總樓地板面積37萬4千，由設計，團隊、韩国等承造，於1999年動工，2004年12月31日完工啟用；最初名稱為<b>台北國際金融中心</b>（<span lang="en">Taipei World Financial Center</span>），2003年改為現名，亦俗稱為<b>101大樓</b>。興建與經營機構為。其為，曾於2004年12月31日至2010年1月4日間擁有的紀錄，目前為以及環最高，完工以來即成為重要之一。此外，大樓內擁有全球第二大的（僅次）、全球唯二開放遊客觀賞的巨型阻尼器（另一個為上海中心之「上海慧眼」），以及全球起降速度第四快的，僅次於、與。</p>',
                '<p><b>台北101</b> ，以及全球起降速度第四快的，僅次於、與。</p>'
            ],
            // Content inside Japanese parentheticals are also stripped
            [
                '<p><b>台湾</b>（たいわん、: <span lang="zh" xml:lang="zh">臺灣 / 台灣</span>、: Tâi-oân）は、のである。</p>',
                '<p><b>台湾</b> は、のである。</p>'
            ],
            // Content inside Cantonese parentheticals are also stripped
            [
                '<p><b>蔡英文</b>（<b>Tsai Ing-wen</b>，<a>1956年</a><a>8月31號</a>—）係現任<a>中華民國總統</a>，<a>臺灣</a>學者同埋<a>政治</a>人，<a>民主進步黨</a><a>主席</a>。</p>',
                '<p><b>蔡英文</b> 係現任<span>中華民國總統</span>，<span>臺灣</span>學者同埋<span>政治</span>人，<span>民主進步黨</span><span>主席</span>。</p>'
            ],
            // Content inside parentheticals written in `wuu` language variant are also stripped
            [
                '<p><b>东亚</b>（日文：東アジア ‧ 東亜，韩文：東아시아，西文：Asia Oriental）是一个比较笼统个地理概念，立在弗同个语境当中有弗一样个含义。东亚个概念来自<a>欧洲</a>人对东方个定位，拿<a>博斯普鲁斯海峡</a>、<a class="new">乌拉尔山脉</a>东面个广大欧亚大陆地区侪通称亚洲，拿西太平洋沿岸、欧亚大陆东端个地区就叫做<a class="mw-selflink selflink">东亚</a>。</p>',
                '<p><b>东亚</b> 是一个比较笼统个地理概念，立在弗同个语境当中有弗一样个含义。东亚个概念来自<span>欧洲</span>人对东方个定位，拿<span>博斯普鲁斯海峡</span>、<span class="new">乌拉尔山脉</span>东面个广大欧亚大陆地区侪通称亚洲，拿西太平洋沿岸、欧亚大陆东端个地区就叫做<span class="mw-selflink selflink">东亚</span>。</p>'
            ],
            // Content inside parentheticals written in `gan` language variant are also stripped
            [
                '<p><b>亞細亞洲</b>（古希臘文：Ασία），又簡稱<b>亞洲</b>，絕大部分都位到北半球，係全世界上最大，最多人嗰一隻<a class="mw-redirect">洲</a>。佢東頭一徑到白令海峽嗰傑日尼奧夫角（西經169度40分，北緯60度5分），南頭一徑到努沙登加拉群島（東經103度30分，南緯11度7分），西頭一徑到巴巴角（東經26度3分，北緯39度27分），北頭一徑到切柳斯金角（東經104度18分，北緯77度43分），最高嗰山係<a>珠穆朗瑪峰</a>。亞洲東西嗰時差係11小時。佢西首連到<a>歐洲</a>，箇就係世界上最大嗰大陸-<a class="new">歐亞大陸</a>。</p>',
                '<p><b>亞細亞洲</b> ，最高嗰山係<span>珠穆朗瑪峰</span>。亞洲東西嗰時差係11小時。佢西首連到<span>歐洲</span>，箇就係世界上最大嗰大陸-<span class="new">歐亞大陸</span>。</p>'
            ],
            // Content inside parentheticals is not stripped if it doesn't include any spaces
            [
                '<p>Der <b>Deutsche Orden</b>, auch <b>Deutschherrenorden</b> oder <b>Deutschritterorden</b> genannt, ist eine römisch-katholische <a>Ordensgemeinschaft</a>. Mit dem <a>Johanniter-</a> und dem <a>Malteserorden</a> steht er in der (Rechts-)Nachfolge der <a>Ritterorden</a> aus der Zeit der <a>Kreuzzüge</a>. Die Mitglieder des Ordens sind seit der Reform der Ordensregel 1929 <a>regulierte Chorherren</a>. Der Orden hat gegenwärtig 1100 Mitglieder, darunter 100 <a>Priester</a> und 200 Ordensschwestern, die sich vorwiegend karitativen Aufgaben widmen. Der Hauptsitz befindet sich heute in <a>Wien</a>.</p>',
                '<p>Der <b>Deutsche Orden</b>, auch <b>Deutschherrenorden</b> oder <b>Deutschritterorden</b> genannt, ist eine römisch-katholische <span>Ordensgemeinschaft</span>. Mit dem <span>Johanniter-</span> und dem <span>Malteserorden</span> steht er in der (Rechts-)Nachfolge der <span>Ritterorden</span> aus der Zeit der <span>Kreuzzüge</span>. Die Mitglieder des Ordens sind seit der Reform der Ordensregel 1929 <span>regulierte Chorherren</span>. Der Orden hat gegenwärtig 1100 Mitglieder, darunter 100 <span>Priester</span> und 200 Ordensschwestern, die sich vorwiegend karitativen Aufgaben widmen. Der Hauptsitz befindet sich heute in <span>Wien</span>.</p>'
            ],
            // Content inside parentheticals with single word and leading space is not stripped
            [
                '<p>Pilot error was ( sic) the cause of the crash</p>',
                '<p>Pilot error was ( sic) the cause of the crash</p>'
            ],
            // Content inside parentheticals with multiple words and leading space is stripped
            [
                '<p>The golden age ( 1917 to 1980) saw lots of inventions.</p>',
                '<p>The golden age saw lots of inventions.</p>'
            ],
            // Parentheticals stripping is not greedy
            [
                '<p>Spain (Spanish: España [esˈpaɲa]), officially the Kingdom of Spain (Spanish: Reino de España), is a sovereign state located on the Iberian Peninsula in southwestern Europe, with two large archipelagoes, the Balearic Islands in the Mediterranean Sea and the Canary Islands off the North African Atlantic coast, two cities, Ceuta and Melilla, in the North African mainland and several small islands in the Alboran Sea near the Moroccan coast. The country\'s mainland is bordered to the south and east by the Mediterranean Sea except for a small land boundary with Gibraltar; to the north and northeast by France, Andorra, and the Bay of Biscay; and to the west and northwest by Portugal and the Atlantic Ocean. It is the only European country to have a border with an African country (Morocco) and its African territory accounts for nearly 5% of its population, mostly in the Canary Islands but also in Ceuta and Melilla</p>',
                '<p>Spain, officially the Kingdom of Spain, is a sovereign state located on the Iberian Peninsula in southwestern Europe, with two large archipelagoes, the Balearic Islands in the Mediterranean Sea and the Canary Islands off the North African Atlantic coast, two cities, Ceuta and Melilla, in the North African mainland and several small islands in the Alboran Sea near the Moroccan coast. The country\'s mainland is bordered to the south and east by the Mediterranean Sea except for a small land boundary with Gibraltar; to the north and northeast by France, Andorra, and the Bay of Biscay; and to the west and northwest by Portugal and the Atlantic Ocean. It is the only European country to have a border with an African country (Morocco) and its African territory accounts for nearly 5% of its population, mostly in the Canary Islands but also in Ceuta and Melilla</p>'
            ]
        ];
        testCases.forEach((test) => {
            assert.equal(summarize(test[0]), test[1], test[2]);
        });
    });
});
/* eslint-enable max-len */
