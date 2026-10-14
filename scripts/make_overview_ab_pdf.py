#!/usr/bin/env python3
"""Visual PDF mock of Overview combining variants A + B."""

from pathlib import Path

from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

OUT = Path("/opt/cursor/artifacts/pult-obzor-variant-a-plus-b.pdf")
OUT_REPO = Path("/workspace/docs/pult-obzor-variant-a-plus-b.pdf")
OUT.parent.mkdir(parents=True, exist_ok=True)

pdfmetrics.registerFont(TTFont("DejaVu", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DejaVuBold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))

INK = HexColor("#0c1210")
SOFT = HexColor("#24302c")
MUTED = HexColor("#5a6862")
PAPER = HexColor("#f7f8f6")
CANVAS = HexColor("#ebefec")
LINE = HexColor("#d5dbd7")
ACCENT = HexColor("#0b6b56")
ACCENT_SOFT = HexColor("#d7eee6")
GOLD = HexColor("#9a7b4f")
WARM = HexColor("#b86a3d")
WHITE = white


def rrect(c, x, y, w, h, r=8, fill=None, stroke=None, width=0.6):
    c.saveState()
    if fill:
        c.setFillColor(fill)
    if stroke:
        c.setStrokeColor(stroke)
        c.setLineWidth(width)
    c.roundRect(x, y, w, h, r, fill=1 if fill else 0, stroke=1 if stroke else 0)
    c.restoreState()


def text(c, s, x, y, size=10, bold=False, color=INK, align="left", max_w=None):
    c.setFont("DejaVuBold" if bold else "DejaVu", size)
    c.setFillColor(color)
    if align == "center":
        c.drawCentredString(x, y, s)
    elif align == "right":
        c.drawRightString(x, y, s)
    else:
        c.drawString(x, y, s)


def line_chart(c, x, y, w, h, values, color=ACCENT):
    """Soft area + line chart."""
    c.saveState()
    pad_l, pad_b, pad_t, pad_r = 22, 16, 10, 8
    px, py = x + pad_l, y + pad_b
    pw, ph = w - pad_l - pad_r, h - pad_b - pad_t
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    for i in range(4):
        gy = py + ph * i / 3
        c.line(px, gy, px + pw, gy)
    mx, mn = max(values), min(values)
    span = max(mx - mn, 0.1)
    pts = []
    for i, v in enumerate(values):
        tx = px + (pw * i / (len(values) - 1))
        ty = py + ((v - mn) / span) * ph * 0.85 + ph * 0.08
        pts.append((tx, ty))
    # area
    path = c.beginPath()
    path.moveTo(pts[0][0], py)
    for tx, ty in pts:
        path.lineTo(tx, ty)
    path.lineTo(pts[-1][0], py)
    path.close()
    fill = Color(ACCENT.red, ACCENT.green, ACCENT.blue, alpha=0.12)
    c.setFillColor(fill)
    c.drawPath(path, fill=1, stroke=0)
    # line
    c.setStrokeColor(color)
    c.setLineWidth(1.8)
    c.setLineCap(1)
    c.setLineJoin(1)
    p2 = c.beginPath()
    p2.moveTo(pts[0][0], pts[0][1])
    for tx, ty in pts[1:]:
        p2.lineTo(tx, ty)
    c.drawPath(p2, stroke=1, fill=0)
    for tx, ty in pts:
        c.setFillColor(WHITE)
        c.circle(tx, ty, 2.6, fill=1, stroke=0)
        c.setStrokeColor(color)
        c.setLineWidth(1.2)
        c.circle(tx, ty, 2.6, fill=0, stroke=1)
    # x labels
    labels = ["Нед 1", "Нед 2", "Нед 3", "Нед 4", "Нед 5", "Нед 6"]
    c.setFont("DejaVu", 6.5)
    c.setFillColor(MUTED)
    for i, (tx, _) in enumerate(pts):
        c.drawCentredString(tx, y + 4, labels[i])
    c.restoreState()


def grouped_bars(c, x, y, w, h, series_a, series_b):
    c.saveState()
    pad_l, pad_b, pad_t, pad_r = 18, 16, 8, 8
    px, py = x + pad_l, y + pad_b
    pw, ph = w - pad_l - pad_r, h - pad_b - pad_t
    n = len(series_a)
    group = pw / n
    mx = max(max(series_a), max(series_b), 1)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    for i in range(4):
        c.line(px, py + ph * i / 3, px + pw, py + ph * i / 3)
    bw = group * 0.28
    for i in range(n):
        gx = px + i * group + group * 0.22
        ha = (series_a[i] / mx) * ph * 0.9
        hb = (series_b[i] / mx) * ph * 0.9
        c.setFillColor(ACCENT)
        c.roundRect(gx, py, bw, ha, 2, fill=1, stroke=0)
        c.setFillColor(HexColor("#c5cdc8"))
        c.roundRect(gx + bw + 3, py, bw, hb, 2, fill=1, stroke=0)
    labels = ["Н1", "Н2", "Н3", "Н4", "Н5", "Н6"]
    c.setFont("DejaVu", 6.5)
    c.setFillColor(MUTED)
    for i in range(n):
        c.drawCentredString(px + i * group + group * 0.5, y + 4, labels[i])
    # legend
    c.setFillColor(ACCENT)
    c.roundRect(x + w - 78, y + h - 14, 8, 8, 1.5, fill=1, stroke=0)
    c.setFillColor(MUTED)
    c.setFont("DejaVu", 6.5)
    c.drawString(x + w - 66, y + h - 12, "Успех")
    c.setFillColor(HexColor("#c5cdc8"))
    c.roundRect(x + w - 40, y + h - 14, 8, 8, 1.5, fill=1, stroke=0)
    c.setFillColor(MUTED)
    c.drawString(x + w - 28, y + h - 12, "Отказ")
    c.restoreState()


def hbar(c, x, y, w, h, items, colors):
    """Horizontal bars for load."""
    c.saveState()
    mx = max(v for _, v in items) or 1
    row_h = h / len(items)
    for i, (label, val) in enumerate(items):
        ry = y + h - (i + 1) * row_h + 4
        c.setFont("DejaVu", 7.5)
        c.setFillColor(SOFT)
        c.drawString(x, ry + 6, label)
        bar_x = x + 58
        bar_w = w - 78
        c.setFillColor(HexColor("#e4eae6"))
        c.roundRect(bar_x, ry + 3, bar_w, 10, 3, fill=1, stroke=0)
        c.setFillColor(colors[i % len(colors)])
        c.roundRect(bar_x, ry + 3, bar_w * (val / mx), 10, 3, fill=1, stroke=0)
        c.setFillColor(MUTED)
        c.setFont("DejaVu", 7)
        c.drawRightString(x + w - 2, ry + 5, str(val))
    c.restoreState()


def donut(c, cx, cy, r, slices):
    """slices: list of (value, color)."""
    import math

    total = sum(v for v, _ in slices) or 1
    start = 90
    for val, col in slices:
        angle = 360 * (val / total)
        c.setFillColor(col)
        # reportlab wedge via path
        p = c.beginPath()
        p.moveTo(cx, cy)
        # approximate with pie
        c.setStrokeColor(col)
        c.setLineWidth(0)
        # use partial disk via clip wedge - simpler: drawArc thick
        # Draw as filled wedge using path with many points
        steps = max(8, int(angle / 3))
        p = c.beginPath()
        p.moveTo(cx, cy)
        for s in range(steps + 1):
            a = math.radians(start - angle * s / steps)
            p.lineTo(cx + r * math.cos(a), cy + r * math.sin(a))
        p.close()
        c.setFillColor(col)
        c.drawPath(p, fill=1, stroke=0)
        start -= angle
    # hole
    c.setFillColor(WHITE)
    c.circle(cx, cy, r * 0.58, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("DejaVuBold", 11)
    c.drawCentredString(cx, cy + 2, "100%")
    c.setFont("DejaVu", 6.5)
    c.setFillColor(MUTED)
    c.drawCentredString(cx, cy - 10, "активные")


def funnel_step(c, x, y, w, h, n, title, value, total):
    rrect(c, x, y, w, h, r=7, fill=WHITE, stroke=LINE)
    text(c, f"{n}. {title}", x + 8, y + h - 14, size=7.5, color=MUTED)
    text(c, str(value), x + 8, y + h - 32, size=14, bold=True, color=INK)
    # progress
    bar_w = w - 16
    c.setFillColor(HexColor("#e4eae6"))
    c.roundRect(x + 8, y + 10, bar_w, 7, 3, fill=1, stroke=0)
    c.setFillColor(ACCENT if n == 4 else HexColor("#4a8f7c"))
    c.roundRect(x + 8, y + 10, bar_w * (value / total), 7, 3, fill=1, stroke=0)


def draw_page(c: canvas.Canvas):
    W, H = A4
    # page bg
    c.setFillColor(CANVAS)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # header strip
    rrect(c, 12 * mm, H - 22 * mm, W - 24 * mm, 14 * mm, r=9, fill=WHITE, stroke=LINE)
    text(c, "ПУЛЬТ  ·  ОБЗОР", 18 * mm, H - 14.5 * mm, size=8, bold=True, color=ACCENT)
    text(c, "Вариант A + B  ·  макет для Президента", W / 2, H - 14.5 * mm, size=9, bold=True, color=INK, align="center")
    text(c, "шикардорс.рф", W - 18 * mm, H - 14.5 * mm, size=8, color=MUTED, align="right")

    # title block
    text(c, "Обзор салона", 14 * mm, H - 32 * mm, size=18, bold=True, color=INK)
    text(
        c,
        "Спокойная аналитика + воронка и нагрузка команды  ·  демо-данные",
        14 * mm,
        H - 38 * mm,
        size=8.5,
        color=MUTED,
    )

    # KPI row — variant A
    kpis = [
        ("2,6 млн ₽", "Выручка месяца", ACCENT_SOFT, ACCENT),
        ("41%", "Конверсия КП→сделка", HexColor("#f0ebe3"), GOLD),
        ("7", "Просрочек", HexColor("#f7ebe6"), WARM),
        ("18", "Открытых задач", HexColor("#e8eef5"), HexColor("#3d6e9a")),
    ]
    gap = 4 * mm
    kpi_w = (W - 24 * mm - 3 * gap) / 4
    ky = H - 62 * mm
    for i, (val, label, bg, fg) in enumerate(kpis):
        kx = 12 * mm + i * (kpi_w + gap)
        rrect(c, kx, ky, kpi_w, 18 * mm, r=8, fill=WHITE, stroke=LINE)
        c.setFillColor(bg)
        c.roundRect(kx + 2, ky + 2, 3.2, 14, 1.5, fill=1, stroke=0)
        text(c, val, kx + 8, ky + 10, size=12, bold=True, color=INK)
        text(c, label, kx + 8, ky + 4, size=7, color=MUTED)

    # Charts row — A
    chart_y = H - 118 * mm
    chart_h = 50 * mm
    left_w = (W - 24 * mm - gap) * 0.55
    right_w = (W - 24 * mm - gap) * 0.45
    rrect(c, 12 * mm, chart_y, left_w, chart_h, r=9, fill=WHITE, stroke=LINE)
    text(c, "Выручка по неделям", 12 * mm + 8, chart_y + chart_h - 12, size=9, bold=True)
    text(c, "млн ₽  ·  демо", 12 * mm + left_w - 8, chart_y + chart_h - 12, size=7, color=MUTED, align="right")
    line_chart(c, 12 * mm + 4, chart_y + 2, left_w - 8, chart_h - 16, [2.1, 2.4, 1.9, 2.8, 3.1, 2.6])

    rx = 12 * mm + left_w + gap
    rrect(c, rx, chart_y, right_w, chart_h, r=9, fill=WHITE, stroke=LINE)
    text(c, "Успех / отказ", rx + 8, chart_y + chart_h - 12, size=9, bold=True)
    text(c, "шт. за неделю", rx + right_w - 8, chart_y + chart_h - 12, size=7, color=MUTED, align="right")
    grouped_bars(
        c,
        rx + 4,
        chart_y + 2,
        right_w - 8,
        chart_h - 16,
        [8, 11, 7, 14, 12, 10],
        [3, 2, 4, 3, 2, 3],
    )

    # Funnel — B
    text(c, "Воронка продажи", 14 * mm, chart_y - 8 * mm, size=10, bold=True, color=INK)
    text(c, "путь клиента  ·  демо", 14 * mm + 42 * mm, chart_y - 8 * mm, size=7.5, color=MUTED)
    fy = chart_y - 32 * mm
    fh = 20 * mm
    steps = [("Заявки", 48), ("КП", 31), ("Замер", 19), ("Сделка", 12)]
    sw = (W - 24 * mm - 3 * gap) / 4
    for i, (title, val) in enumerate(steps):
        funnel_step(c, 12 * mm + i * (sw + gap), fy, sw, fh, i + 1, title, val, 48)
        if i < 3:
            # arrow
            ax = 12 * mm + i * (sw + gap) + sw + 1.2 * mm
            c.setFillColor(LINE)
            c.setFont("DejaVu", 10)
            c.drawString(ax - 1, fy + fh / 2 - 2, "›")

    # Bottom: load + donut + direction accordions hint
    by = 18 * mm
    bh = fy - by - 8 * mm
    mid_w = (W - 24 * mm - gap) * 0.52
    side_w = (W - 24 * mm - gap) * 0.48

    rrect(c, 12 * mm, by + 28 * mm, mid_w, bh - 28 * mm, r=9, fill=WHITE, stroke=LINE)
    text(c, "Нагрузка по ответственным", 12 * mm + 8, by + bh - 10, size=9, bold=True)
    text(c, "активные сделки", 12 * mm + mid_w - 8, by + bh - 10, size=7, color=MUTED, align="right")
    hbar(
        c,
        12 * mm + 8,
        by + 34 * mm,
        mid_w - 16,
        bh - 48 * mm,
        [("Илья", 14), ("Мария", 11), ("Президент", 9), ("Ксения", 7)],
        [ACCENT, HexColor("#4a8f7c"), GOLD, HexColor("#7a8f88")],
    )

    sx = 12 * mm + mid_w + gap
    rrect(c, sx, by + 28 * mm, side_w, bh - 28 * mm, r=9, fill=WHITE, stroke=LINE)
    text(c, "Доля направлений", sx + 8, by + bh - 10, size=9, bold=True)
    donut(
        c,
        sx + 28 * mm,
        by + 28 * mm + (bh - 28 * mm) / 2 - 2,
        22 * mm,
        [(42, ACCENT), (38, HexColor("#6a9e8d")), (20, GOLD)],
    )
    # legend
    lx = sx + 58 * mm
    ly = by + 28 * mm + (bh - 28 * mm) / 2 + 12
    for label, col, pct in [
        ("Продажа", ACCENT, "42%"),
        ("Поставка", HexColor("#6a9e8d"), "38%"),
        ("Сервис", GOLD, "20%"),
    ]:
        c.setFillColor(col)
        c.circle(lx, ly + 3, 3, fill=1, stroke=0)
        text(c, label, lx + 8, ly, size=8, color=SOFT)
        text(c, pct, lx + 48, ly, size=8, bold=True, color=INK)
        ly -= 14

    # direction chips (accordion reminder from current UI)
    chips = [("Продажа", "12 сделок"), ("Поставка", "9 сделок"), ("Сервис", "4 сделки")]
    cw = (W - 24 * mm - 2 * gap) / 3
    for i, (name, meta) in enumerate(chips):
        cx = 12 * mm + i * (cw + gap)
        rrect(c, cx, by, cw, 22 * mm, r=8, fill=WHITE, stroke=LINE)
        # soft header band
        c.setFillColor(ACCENT_SOFT)
        c.roundRect(cx + 1, by + 11 * mm, cw - 2, 10 * mm, 7, fill=1, stroke=0)
        text(c, "НАПРАВЛЕНИЕ", cx + 8, by + 16.5 * mm, size=6, color=MUTED)
        text(c, name, cx + 8, by + 12 * mm, size=10, bold=True, color=INK)
        text(c, meta + "  ·  нажмите, чтобы раскрыть этапы", cx + 8, by + 5, size=7, color=MUTED)
        text(c, "▾", cx + cw - 10, by + 12 * mm, size=9, color=MUTED)

    # footer
    text(
        c,
        "Макет A+B  ·  не финальный UI-код  ·  Пульт / шикардорс.рф",
        W / 2,
        8 * mm,
        size=7,
        color=MUTED,
        align="center",
    )


def main():
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("Пульт · Обзор A+B")
    c.setAuthor("Пульт")
    draw_page(c)
    c.showPage()

    # page 2 — legend / what combines
    W, H = A4
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    text(c, "Что соединили", 14 * mm, H - 20 * mm, size=16, bold=True)
    text(c, "Вариант A (спокойная аналитика) + Вариант B (воронка и нагрузка)", 14 * mm, H - 28 * mm, size=9, color=MUTED)

    blocks = [
        (
            "Из варианта A",
            [
                "Четыре KPI сверху — выручка, конверсия, просрочки, задачи",
                "Линия выручки по неделям с мягкой заливкой",
                "Столбцы «успех / отказ» без тяжёлых цветов",
                "Много воздуха, без неона и лишних виджетов",
            ],
        ),
        (
            "Из варианта B",
            [
                "Воронка Заявки → КП → Замер → Сделка",
                "Горизонтальная нагрузка по ответственным",
                "Кольцо доли направлений (Продажа / Поставка / Сервис)",
                "Акцент на процессе салона, а не только на деньгах",
            ],
        ),
        (
            "Как остаётся из текущего Пульта",
            [
                "Три направления снизу — раскрываются по клику",
                "Этапы внутри — тоже выпадающие списки",
                "Палитра: хвойный акцент + песок + светлая бумага",
            ],
        ),
    ]
    by = H - 40 * mm
    for title, items in blocks:
        rrect(c, 12 * mm, by - 42 * mm, W - 24 * mm, 44 * mm, r=9, fill=WHITE, stroke=LINE)
        text(c, title, 18 * mm, by - 8 * mm, size=11, bold=True, color=ACCENT)
        yy = by - 16 * mm
        for it in items:
            c.setFillColor(ACCENT)
            c.circle(20 * mm, yy + 2.5, 1.6, fill=1, stroke=0)
            text(c, it, 24 * mm, yy, size=9, color=SOFT)
            yy -= 7 * mm
        by -= 50 * mm

    rrect(c, 12 * mm, 20 * mm, W - 24 * mm, 28 * mm, r=9, fill=ACCENT_SOFT, stroke=ACCENT, width=0.8)
    text(c, "Следующий шаг", 18 * mm, 38 * mm, size=10, bold=True, color=ACCENT)
    text(
        c,
        "Если макет ок — внедряю этот вид в живой экран Обзора с демо-данными и лёгкой анимацией.",
        18 * mm,
        30 * mm,
        size=9,
        color=SOFT,
    )
    text(
        c,
        "Напишите «делай» — соберу в код и выложу на github.io.",
        18 * mm,
        24 * mm,
        size=9,
        color=MUTED,
    )

    c.showPage()
    c.save()
    OUT_REPO.write_bytes(OUT.read_bytes())
    print(OUT)
    print(OUT_REPO)
    print(OUT.stat().st_size)


if __name__ == "__main__":
    main()
