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
natchem-2027-hbond.jpg
# 2026
jacs-2026-coreshell.jpg        chem-2026-cpl.jpg              ncomms-2026-switch.jpg
csr-2026-tsi.jpg               chem-asian-j-2026-carbohelicene.jpg  chem-sci-2026-bipyrenyl.jpg
ccschem-2026-helical.jpg       ncomms-2026-atropisomer.jpg    chemmater-2026-rotaxane.jpg
acsami-2026-saccharide.jpg     mater-today-bio-2026-orchitis.jpg  advhealthcare-2026-hydrogel.jpg
polymchem-2026-polyurethane.jpg
# 2025
chem-2025-nir.jpg*             ncomms-2025-emergent.jpg       angew-2025-cof.jpg
afm-2025-sulfur.jpg            polymchem-2025-magnetism.jpg   macromolecules-2025-ring.jpg
# 2024
natrevchem-2024-covalency.jpg  acsmaterlett-2024-lonepair.jpg angew-2024-tsc-length.jpg*
angew-2024-pressure.jpg        angew-2024-twophoton.jpg       scichinachem-2024-tsvstb.jpg
jmca-2024-picric.jpg           angew-2024-cycloarene.jpg      angew-2024-radicals.jpg
natphotonics-2024-scintillator.jpg  ncomms-2024-polyester.jpg materhoriz-2024-polyester.jpg
# 2023
jacs-2023-oddeven.jpg*         ccschem-2023-clusterolum.jpg   cej-2023-heavyatom.jpg
tetrahedron-2023-photochromism.jpg  smartmol-2023-diphenylmethane.jpg  macromolecules-2023-enolate.jpg
angew-2023-phenolic.jpg        biosens-2023-porphyrin.jpg     ocf-2023-pyrone.jpg
# 2022
analchem-2022-esterase.jpg     photonicsres-2022-led.jpg      aggregate-2022-carbonyl.jpg
chemcommun-2022-antihae.jpg    jmcc-2022-photochromism.jpg    analchem-2022-membrane.jpg
analchem-2022-pec.jpg
# 2021
chemsci-2021-photochromism.jpg aom-2021-silole.jpg            analchem-2021-hof.jpg
```

带 `*` 的三张（Chem 2025、JACS 2023、Angew 2024）已放入真实 TOC 图；其余待补。

## 常见修改

- **改论文/加论文**：编辑 `index.html` 中 `#tab2026` / `#tab2025` 内的 `<article class="paper">` 卡片；年份小标题 `# 篇数` 需同步更新。
- **换头像**：覆盖 `assets/portrait.jpg`。
- **改文字**：直接编辑 `index.html` 对应区块。
