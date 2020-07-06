/**
 * Created by user on 2020/1/17.
 */

import { lazyMatchNot } from '../../lib/util';

/**
 * 分析後不應該存在符合以下結果
 */
export const tests_lazy_base_not: [string, Parameters<typeof lazyMatchNot>['1'], Parameters<typeof lazyMatchNot>['2']?][] = [

	[
		'這份毫不守舊的率直',
		[
			'份毫',
		],
	],

	[
		'在外面放哨的大概有十來人',
		[
			'在外',
		]
	],

	[
		'正是這份工作的不二人選',
		[
			'份工',
		],
	],


	[
		'好像是有商人為了攬客正大聲吆喝著',
		[
			'正大',
		],
	],

	[
		'比起《水月迷宮》中出現的哥布林身體能力有若干的提高',
		[
			'體能',
			['干的', '幹的', '乾的'],
		],
	],

	[
		'所以来办一场上梁仪式吧',
		[
			'以来',
		],
	],

	[
		'莉法娜发出沒力的聲音',
		[
			'出沒',
		],
	],

	[
		'伯納士坐在馬車的御馬台上緊緊攥著繮繩',
		[
			'上緊',
		],
	],

	[
		'每個桌子邊都有數名手拿酒翁的女性等候在一旁',
		[
			'名手',
		],
	],

	[
		'舌头互相交缠的淫秽声响静静地传了出来',
		[
			'相交',
		],
	],

	[
		'《寂靜領域》的發動和操作最好不要依賴聲音',
		[
			'好不',
		],
	],

	[
		'卻奇怪的很講義氣',
		[
			'講義',
		],
	],

	[
		'N在抵達異世界的數天后',
		[
			'天后',
		],
	],


	[
		'只要用對方法說不定就能無人犧牲',
		[
			'對方',
		],
	],

	[
		'在學院潛心于古今魔術的研究',
		[
			'在學',
		],
	],

	[
		'如果說卡麗婭各處所營造出的舉止和氛圍是高貴的話',
		[
			'處所',
		],
	],

	[
		'被占領了',
		[
			['被占', '被佔'],
		],
	],

	[
		'兩個人像浮屍一樣浮上了水面時競技也已經結束了',
		[
			['人像'],
		],
	],

	[
		'我用手里長劍與哥布林交手',
		[
			['里長'],
		],
	],

	[
		'魚如果干巴巴的',
		[
			['果干','果乾'],
		],
	],

	[
		'馬虎的发起兵糧飼草的採購及武器的護理等，也會產生各種各樣麻煩的費用。',
		[
			'起兵',
		],
	],

	[
		'在我把買來的炒面面包吞下去的時候',
		[
			'面面',
		],
	],

	[
		'她准備齊全地待在起居室等待──早起的理由則被她含糊帶過，說什麼也不肯告訴我。',
		[
			['備齊']
		],
	],

	[
		'柔荑掩嘴這一舉止的優雅應該值得世間所有的淑女學習吧。',
		[
			['一舉',],
		],
	],

	[
		'迪亚困倦地揉着眼睛走了过来。',
		[
			['着眼',],
		],
	],

	[
		'「啊，那可糟了。圖書室根本不通融。即使遲到一秒，別人就會佔掉座位了。」',
		[
			['不通',],
		],
	],

	[
		'在那個領域裡，魔族的核實體化了，肉體的分解·再構成變得不能。」',
		[
			['核實',],
		],
	],

	[
		'一邊看著熟睡在沙发上的夏緹亞',
		[
			['发上','發上']
		],
	],

	[
		'百合繪的異常性就浮現出來了',
		[
			['浮現出',],
		],
	],

	[
		'言簡而意賅，媽媽的意圖我已了然於心。',
		[
			['然於']
		],
	],

	[
		'所以並不想合作到這種地步。',
		[
			['種地']
		],
	],

	[
		'廣瀨的下一個對象是我嗎？很遺憾，對男人沒有興趣。',
		[
			['象是']
		],
	],

	[
		'　墮入絕望的深淵的她，最後抓住的對象是――',
		[
			['象是']
		],
	],

	[
		'「唔⋯⋯于南天邊境尋光⋯⋯發行・輝石龕燈！」',
		[
			'天邊',
		],
	],

	[
		'「⋯⋯唉，汝那胡來的惡習還是一如以往吶。若是引起『變異性休克』而死，那可怎麼辦？大蠢材。」',
		[
			'異性',
		],
	],

	[
		'我們也該做出发的準備了嗎？',
		[
			'做出',
		],
	],

	[
		'一整天做出发的準備、隔天早上、一行人從迷宮都市出發了。',
		[
			'做出',
		],
	],

	[
		'他將身體靠在稍遠處的粗大樹干上',
		[
			'大樹',
		],
	],

	[
		'對于越過巴特拉姆攻來的灰衣人們',
		[
			'于越',
		],
	],

	[
		'阿一並沒有回答',
		[
			['一並', '一併'],
		],
	],

	[
		'簡單一句話',
		[
			['單一', '單一句話'],
		],
	],

	[
		'簡單一句話',
		[
			['句話'],
		],
	],

	[
		'消滅旋殻大海龜后',
		[
			['大海'],
		],
	],

	[
		'差點就把自己最重要的部分于大庭廣眾之下大公開了。',
		[
			['大公'],
		],
	],

	[
		'但我不可能忘記那個城鎮的事情還有幸存下來的你',
		[
			['有幸'],
		],
	],

	[
		'記得之前教科書移除了几篇魯迅的文章，現在大概沒有了。）',
		[
			['除了'],
		],
	],

	[
		'「哼，敵臨于前卻連戰意都保持不了⋯⋯⋯所以說你們都是雜魚啊」',
		[
			['連戰'],
		],
	],

	[
		'“……竟然还有幸存的吸血鬼吗？”',
		[
			['有幸'],
		],
	],

	[
		'但真正的意图果然应该是想要为处理掉雷欧制造出借口',
		[
			['出借'],
		],
	],

	[
		'打磨骨头是雷欧尼斯的一大业余爱好。',
		[
			['大业'],
		],
	],

	[
		'「我对『素子』的生活方式抱持过数次疑问',
		[
			['过数'],
		],
	],

	[
		'新闻网站所播的VTR似乎经过后制',
		[
			['过后', '过後'],
		],
	],

	[
		'透过后制隐瞒当事人的真实身分之后',
		[
			['过后', '过後'],
		],
	],

	[
		'三成人情人節想收口罩酒精液',
		[
			['成人'],
			['收口'],
			['精液'],
		],
	],

	[
		'，我是唯一拥有“安全区”的人，',
		[
			['全区'],
		],
	],

	[
		'早前提堂後須還押候訊',
		[
			['前提'],
		],
	],

	[
		'亚贵妃巡视着重新恢复了视野的四周。',
		[
			['着重'],
		],
	],

	[
		'命就是在那样的地方而生……从偶然打开洞口里出来，一不小心闯入了这川濑良市。',
		[
			['口里', '口裡'],
		],
	],

	[
		'向地下降去的斜坡就像是黄泉平板',
		[
			['下降'],
		],
	],

	[
		'只有當負責人判斷是應該傳達的情報時',
		[
			['報時'],
		],
	],

	[
		'梅梅知道原因後,怒吼著「媽媽是大笨蛋」是好幾天后的事情了。',
		[
			'天后',
		],
	],

	[
		'因為一天的登入時間是現實時間合計8小時',
		[
			'入時',
		],
	],

	[
		'像帶鋼筋的混凝土塊這樣的重量物放進去的話,',
		[
			'帶鋼',
		],
	],

	[
		'否则就跟不上这边的水准了',
		[
			'否',
		],
	],

	[
		'是有权能向国王提出谏言',
		[
			'权能',
		],
	],

	[
		'但我无法准许你阅读王城内禁书库的资料',
		[
			['城内'],
			['书库'],
		],
	],

	[
		'已經看過數百遍的動畫。',
		[
			['過數'],
		],
	],

	[
		'真想將這記錄上傳到網路上呢',
		[
			['傳到'],
			['路上'],
		],
	],

	[
		'两个中国人名之间的成分',
		[
			['个中', '中国人'],
		],
	],

	[
		'故事由牢墙内反抗命运的人',
		[
			['事由'],
		],
	],

	[
		'男主角六歲時就因為被發現有驚人的魔法天賦而送往前線參戰',
		[
			['因'],
			['為'],
			['現有'],
			['往前'],
		],
	],

	[
		'提出正确主张的人也反倒会遭遇不幸。',
		[
			['倒会'],
		],
	],

	[
		'★故事发生在兵藤一诚转生成恶魔的数年之前的前传登场！',
		[
			['事发'],
		],
	],

	[
		'在前世好像曾经被魔王的左右手威胁过『要是转生成圣女便杀了你』。',
		[
			['生成'],
		],
	],

	[
		'與其他方式造成的痛苦(就是M)',
		[
			['他方'],
		],
	],

	[
		'魔法禁书目录',
		[
			['书目'],
		],
	],

	[
		'主要是德不配位',
		[
			['要是'],
		],
	],

	[
		'當時政治思想百花齊放',
		[
			['時政'],
		],
	],

	[
		'監察院早就被證明不適用於當代政治',
		[
			['用於'],
		],
	],

	[
		'從胸膛到頭部',
		[
			['到頭'],
		],
	],

	[
		'不停將它拉至深處',
		[
			['至深'],
		],
	],

	[
		'耳機電力連續播放六小時不間斷',
		[
			['機電'],
		],
	],

	[
		'且受限於小屋布景樣式，',
		[
			['限於'],
		],
	],

	[
		'生於平成日本的事',
		[
			['於平'],
		],
	],

	[
		'如果只能和現在那只雜魚菜雞勇者一起比較的話還得了！」',
		[
			['在那'],
		],
	],

	[
		'本來蕾菲爾特姐還想給她下套套她口風的',
		[
			['套套'],
		],
	],

	[
		'但是他卻不知道因為什麼不能大幅度動彈',
		[
			['為什麼'],
		],
	],

];

export default tests_lazy_base_not
