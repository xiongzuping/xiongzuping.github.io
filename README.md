# Zuping Xiong — Personal Academic Website

深色科技风静态个人学术主页。线上地址：**https://xiongzuping.github.io/**

## 文件结构

```
index.html          页面内容（全部文案、论文条目、图片路径都在这里）
css/style.css       深色科技风设计系统（颜色、卡片、动效）
js/main.js          交互脚本（星空、滚动动效、画廊、Tab 切换）
assets/             图片
  portrait.jpg      头像
  feat-*.jpg        学术活动区「Highlighted Work」配图
  acad-*.jpg        学术活动区证书照片
  gallery/          生活画廊（34 张）
  tocs/             论文 TOC 图（详见下方命名规则）
.github/workflows/deploy.yml   自动发布配置
```

## 本地预览

双击 `index.html` 即可在浏览器打开（无需服务器）。

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
natchem-2027-hbond.svg
# 2026
jacs-2026-coreshell.svg        chem-2026-cpl.svg              ncomms-2026-switch.svg
csr-2026-tsi.svg               chem-asian-j-2026-carbohelicene.svg  chem-sci-2026-bipyrenyl.svg
ccschem-2026-helical.svg       ncomms-2026-atropisomer.svg    chemmater-2026-rotaxane.svg
acsami-2026-saccharide.svg     mater-today-bio-2026-orchitis.svg  advhealthcare-2026-hydrogel.svg
polymchem-2026-polyurethane.svg
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
# 2022
analchem-2022-esterase.svg     photonicsres-2022-led.svg      aggregate-2022-carbonyl.svg
chemcommun-2022-antihae.svg    jmcc-2022-photochromism.svg    analchem-2022-membrane.svg
analchem-2022-pec.svg
# 2021
chemsci-2021-photochromism.svg aom-2021-silole.svg            analchem-2021-hof.svg
```

带 `*` 的三张（Chem 2025、JACS 2023、Angew 2024）是论文真实 TOC 图（.jpg）；其余 48 张为按论文主题生成的示意图（.svg，深色科技风）。

**换成官方 TOC 图**：拿到某篇论文的官方 TOC 图后，把图命名为 `<对应文件名>.jpg` 放入 `assets/tocs/`，并把 `index.html` 中该卡片 `<img>` 的 `src` 从 `.svg` 改回 `.jpg` 即可。

## 常见修改

- **改论文/加论文**：编辑 `index.html` 中 `#tab2026` / `#tab2025` 内的 `<article class="paper">` 卡片；年份小标题 `# 篇数` 需同步更新。
- **换头像**：覆盖 `assets/portrait.jpg`。
- **改文字**：直接编辑 `index.html` 对应区块。
