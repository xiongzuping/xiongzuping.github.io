# Zuping Xiong — Personal Academic Website

多肽组装主题静态个人学术主页。线上地址：**https://xiongzuping.com/**（旧地址 xiongzuping.github.io 自动 301 跳转到新域名）。

## 2026-11-18 移动端光效兼容与文字校对（当前版本）

手机及触屏设备使用直接三维渲染和标准 RGBA 柔光，不经过桌面的 HDR 辉光合成。选择依据是指针类型、初始视口和 GPU 能力；横竖屏切换不会反复切换渲染方式。保持相同的六残基模型、接触判断、旋转、原子选择和排列滑块。

桌面 HDR 路径先检测 RGBA16F 格式及 framebuffer，并按该格式支持的样本数选择抗锯齿。旧版仅采用通用 MAX_SAMPLES；[WebGL 规范](https://registry.khronos.org/webgl/extensions/EXT_color_buffer_float/)明确浮点多重采样属于可选支持。另修正辉光重复叠加，避免相同尺寸重复分配渲染目标，并在 WebGL 上下文恢复后重建需要的渲染资源。静态后备图用于 WebGL 不可用或暂时丢失的情况。

姓名显示为 Zuping Xiong，删除末尾装饰句点；校对简介措辞、Research Projects 栏目标题、视频无障碍标签和 GFP 获奖介绍。论文统计按本人确认保留 29 篇第一或通讯作者论文，暂不调整作者角色标记。54 篇论文及 4 个成果视频保留。

验证使用 Windows WebKit 27.2 和 Chromium，覆盖 375/390 像素手机视口与 1440 像素桌面、透明光晕像素、横竖屏切换、上下文恢复及恢复后缩放。交互回归另覆盖 360/820 像素宽度。没有实际 iPhone 硬件测试；这些结果不能代替 Apple GPU 实测。相册布局更新也移到下一帧，避免 WebKit 的 ResizeObserver 循环错误。

## 2026-11-17 六残基寡肽三维版（基础模型与设计）

首屏采用真正的 WebGL 三维寡肽渲染，结构占主要面积，配合柔和的环境反射、原子材质和仅作用于接触区域的辉光。操作区缩为底部工具条；拖动旋转整个结构，滑块改变两条链的相对排列，点击原子查看化学角色。原始论文、视频、个人简介及栏目内容保持。

- `js/oligo-model.js`：六残基 Gly–Sar–Gly–Sar–Gly–Sar，即 (Gly–Sar)₃；C₁₅H₂₆N₆O₇，54 原子、53 键、6 个羰基双键。
- `js/oligo-scene.js`：真实透视相机、实例化原子和键、射线拾取、旋转控制、几何接触分类及选择性辉光。
- `css/oligo-premium.css`：大幅扩大模型、简化面板和文字层级；平板和手机使用纵向布局。
- `vendor/three/`：本地托管 Three.js 0.180.0 及所需插件，含 MIT 许可证；运行时不依赖外部 CDN。包下载已核对 npm SHA-512 完整性。

**化学与模型来源：** 连接关系从明确的六残基 SMILES 构建并验证全部原子价态。单链通过 RDKit 2025.09.6 ETKDGv3 初始化，设定伸展全反式骨架，再进行带骨架扭转约束的 MMFF94s 规整，属于为清楚展示而选择的计算模型，不是实验结构、平衡构象或发光预测。Sar 酰胺氮不作为 N–H 供体或受体；Gly 酰胺 N–H 可以供氢。两链示意路径的 101 个插值状态已检查严重重叠；浏览器中复核了原子连接、刚体键长、供受体和共存接触。所选伸展构象没有符合筛选条件的链内接触，因此不虚构链内氢键。

光晕和接触颜色仅用于解释几何接触。氢键与其他 O/N 接触可以共存；接触数不代表作用能或发光强度。具体阈值和边界见网页 “Explore the model”。

通过 HTTP 预览：在仓库目录执行 `python -m http.server 8000` 后打开 `http://localhost:8000`。由于使用 ES modules，直接双击 HTML 文件不适用于当前三维模块。

旧版模型和渲染脚本保留历史记录，当前页面只加载 `oligo-model.js` 和 `oligo-scene.js`。

## 2026-11-17 含肌氨酸短肽交互版（历史记录）

首屏使用含肌氨酸的三肽 **Gly–Sar–Gly**，可通过预设、滑块和水平拖动改变两条链的相对排列。青色虚线显示符合几何筛选条件的氢键，紫色点线显示其他 O/N 近接；独立统计允许两类接触共存。中央 Sar 单元的 N-甲基化位置明确标注，不给该酰胺氮虚构 N–H 供体或氢键受体。

- `js/interaction-model.js`：PubChem CID 23422785 的中性参考构象及全部 27 个原子、26 个共价键、3 个羰基双键；显示用两链排列及原子角色。
- `js/interaction-lab.js`：原子级渲染、刚体变换、几何接触检测、滑块、拖动、原子检查及暂停；尊重减少动态效果设置。
- `css/interaction-lab.css`：互动面板、原子颜色图例、模型注释和移动端布局；沿用原有正文主题。

**科学边界：** 结构连接和单链坐标来自 [PubChem](https://pubchem.ncbi.nlm.nih.gov/compound/23422785)；两链排列是为解释接触几何构造的示意，不是实验晶体堆积、分子动力学轨迹或平衡能量计算。氢键筛选采用 H···A≤2.6 Å、D···A≤3.5 Å、D–H···A≥140°；其他 O/N 近接采用 2.7–3.7 Å。这些阈值仅服务于显示，并非通用作用定义。共价近邻不计入链内非共价接触，两个链保持刚体，链内接触不随拖动伪造变化。其他近接也不直接等同于已证实的孤对电子耦合。光晕是视觉效果，不是实测发光强度或波长。

参考的相关竞争研究 [ACS Materials Letters 2024, DOI 10.1021/acsmaterialslett.4c01182](https://doi.org/10.1021/acsmaterialslett.4c01182) 使用不同分子体系；本页面不声称 Gly–Sar–Gly 是该论文的实验模型。完整说明在首屏的 “About this molecular illustration” 中。

下方保留历次设计记录。当前页面不加载旧版 `peptide-field.js` 或 `peptide-assembly.js`。

## 2026-11-17 动态发光版（历史记录）

全屏背景展示不同示意序列的肽链接近、形成分子间接触、渐变发光、分离变暗的 18 秒循环。背景使用黑蓝底色、青蓝/紫色光效；正文区域降低背景强度以保持可读性。暂停和重播按钮控制整个背景，系统减少动态模式显示静态聚集状态。

- `js/peptide-field.js`：该历史版本的动态背景；残基尺度曲线、距离驱动的接触和发光、缓存柔光、鼠标视差及隐藏标签页暂停。
- `css/emissive-theme.css`：在已有布局上覆盖当前光效主题；首屏语句为 “From through-space interactions to emergent light.”。
- 中英文栏目使用直接对应的标题：About Me / 个人简介、Research Interests / 研究方向、Honors & Awards / 荣誉与奖励、Life in Pictures / 生活剪影、Contact / 联系方式等。

**概念表示边界：** GQNVKST、KVSNQGT、NQGSVKT 仅为此视觉设计中的示意序列，不对应已验证的发光材料。球代表残基，曲线代表主链走向；虚线表示接近时的概念接触，不指认特定氢键。强度和颜色是视觉编码，不是光谱、动力学模拟或对这些序列的预测。不能据此断言所有多肽靠近都会发光。图注在页面可见。

旧版 `js/peptide-assembly.js` 和 `assets/peptide-fallback.svg` 保留供历史回退，当前页面不加载这些文件。以下为上一版记录。

## 2026-11-17 初版视觉升级（历史记录）

首屏为深墨绿背景、青绿/暖金/珊瑚色的交互式多肽结构。桌面双栏、手机纵向布局；首屏结构可暂停、重播及鼠标拖动。全部论文、成果视频、相册、学术活动、联系方式及统计配置保留。

- `css/peptide-theme.css`：新版排版、配色和响应式样式，覆盖原基础样式。
- `js/peptide-assembly.js`：无外部依赖的 Canvas 结构可视化，约 30 fps，屏外/隐藏页面暂停；尊重系统减少动态效果的设置。
- `assets/peptide-fallback.svg`：相同结构坐标生成的静态后备图；JavaScript 不可用时仍可见。

**结构来源与边界：** 采用 [PDB 9H7U](https://www.rcsb.org/structure/9H7U) 中央层 18 条链的 162 个 Cα 坐标，按每层升高 4.77 Å、扭转 −0.64° 沿轴传播为 21 个显示层。轨迹连接相邻 Cα，表示主链走向，不是直接 Cα–Cα 共价键。展示局部代表通道，并非完整七孔模型。运动为刚体接近的解释性编排，不代表实验测得的生长路径。颜色和高光用于结构辨识，不表示实际发光。网页可见图注引用 Gačanin et al., *Nature* (2026), DOI [10.1038/s41586-026-11016-2](https://doi.org/10.1038/s41586-026-11016-2)；该参考结构不是主页作者的研究成果。

本项目为静态站点，无需安装构建依赖。预览可在仓库目录运行 `python -m http.server 8000`。

## 文件结构

```
index.html          页面内容（全部文案、论文条目、图片路径都在这里）
css/style.css       深色科技风设计系统（颜色、卡片、动效）
js/main.js          交互脚本（滚动动效、画廊、Tab 切换）
CNAME               自定义域名绑定（内容为 xiongzuping.com，勿删）
assets/             图片
  portrait.jpg      头像
  acad-*.jpg        学术活动区（Academic Activities）照片
  gallery/          生活画廊（34 张）
  tocs/             论文 TOC 图（详见下方命名规则）
.github/workflows/deploy.yml   自动发布配置
```

## 域名（重要）

- 主域名 **xiongzuping.com**（2026-10-24 启用），域名在 Spaceship 注册（每年续费），DNS 托管在用户自己的 Cloudflare 账号（免费）。
- DNS 记录（全部「仅 DNS」灰云，**不要开代理橙云**，否则 GitHub Pages 绑定失效）：
  - 4 条 A 记录 `@` → 185.199.108.153 / 185.199.109.153 / 185.199.110.153 / 185.199.111.153
  - 1 条 CNAME `www` → xiongzuping.github.io
- GitHub 绑定靠仓库根目录的 `CNAME` 文件 + Settings → Pages 里的自定义域名（两者必须一致）。
- 换域名时：改 Cloudflare DNS 记录 → 改 `CNAME` 文件 → Settings → Pages 确认并勾选 Enforce HTTPS。

## 本地预览

在仓库目录运行 `python -m http.server 8000`，然后打开 `http://localhost:8000`。当前三维模块使用 ES modules，需要通过 HTTP 加载。

## 发布

```powershell
git add -A; git commit -m "update"; git push
```

推送后 GitHub Actions 约 1 分钟自动发布到线上。

## 论文 TOC 图（重要）

Publications 区每篇论文卡片左侧有一个方形图位：

- **放图即显示**：把 TOC 图按下面的文件名放入 `assets/tocs/`，刷新页面即出现在对应论文上（文件名与卡片一一对应，见 `index.html` 中各 `<img src="assets/tocs/...">`）；
- **没图也美观**：文件不存在时自动显示「期刊缩写 + 年份」占位图，不会出现破图。

文件名对照（`assets/tocs/` 下）：

```
# 2027
natchem-2027-hbond.jpg*
# 2026
jacs-2026-coreshell.jpg*       chem-2026-cpl.jpg*              ncomms-2026-switch.svg
csr-2026-tsi.svg               chem-asian-j-2026-carbohelicene.svg  chem-sci-2026-bipyrenyl.svg
ccschem-2026-helical.svg       ncomms-2026-atropisomer.svg    chemmater-2026-rotaxane.svg
acsami-2026-saccharide.svg     mater-today-bio-2026-orchitis.svg  advhealthcare-2026-hydrogel.svg
polymchem-2026-polyurethane.svg  scichinachem-2026-liquidionic.svg
# 2025
chem-2025-nir.jpg*             ncomms-2025-emergent.svg       angew-2025-cof.svg
afm-2025-sulfur.svg            polymchem-2025-magnetism.svg   macromolecules-2025-ring.svg
# 2024
natrevchem-2024-covalency.svg  acsmaterlett-2024-lonepair.svg angew-2024-tsc-length.jpg*
angew-2024-pressure.svg        angew-2024-twophoton.svg       scichinachem-2024-tsvstb.svg
jmca-2024-picric.svg           angew-2024-cycloarene.svg      angew-2024-radicals.svg
natphotonics-2024-scintillator.svg  ncomms-2024-polyester.svg materhoriz-2024-polyester.svg
# 2023
jacs-2023-oddeven.jpg*         ccschem-2023-clusterolum.svg   cej-2023-heavyatom.svg
tetrahedron-2023-photochromism.svg  smartmol-2023-diphenylmethane.svg  macromolecules-2023-enolate.svg
angew-2023-phenolic.svg        biosens-2023-porphyrin.svg     ocf-2023-pyrone.svg
analchem-2023-hof.svg
# 2022
analchem-2022-esterase.svg     photonicsres-2022-led.svg      aggregate-2022-carbonyl.svg
chemcommun-2022-antihae.svg    jmcc-2022-photochromism.svg    analchem-2022-membrane.svg
analchem-2022-pec.svg
# 2021
chemsci-2021-photochromism.svg aom-2021-silole.svg            analchem-2021-hof.svg
```

带 `*` 的六张（Nat. Chem. 2027、Chem 2026、JACS 2026、Chem 2025、JACS 2023、Angew 2024）是论文真实 TOC / 封面图（.jpg）；其余 47 张为按论文主题生成的示意图（.svg，深色科技风）。

**换成官方 TOC 图**：拿到某篇论文的官方 TOC 图后，把图命名为 `<对应文件名>.jpg` 放入 `assets/tocs/`，并把 `index.html` 中该卡片 `<img>` 的 `src` 从 `.svg` 改回 `.jpg` 即可。

## 常见修改

- **改论文/加论文**：编辑 `index.html` 中 `#tab2026` / `#tab2025` 内的 `<article class="paper">` 卡片；年份小标题 `# 篇数` 需同步更新。
- **换头像**：覆盖 `assets/portrait.jpg`。
- **改文字**：直接编辑 `index.html` 对应区块。

## 访问统计（百度统计）

- 代码已在 `index.html` 的 `<head>` 中预埋（`BAIDU_TONGJI_ID` 占位，未填时完全静默、不发任何请求）。
- 启用步骤：在 [tongji.baidu.com](https://tongji.baidu.com) 注册并添加站点 `https://xiongzuping.github.io/` → 把统计代码里的 32 位 ID 替换 `index.html` 中的 `BAIDU_TONGJI_ID` → `git add -A; git commit -m "enable baidu tongji"; git push` → 回百度统计后台点「代码安装检查」验证 → 后台即可查看访问量 / 访客明细。
