#!/usr/bin/env python3
"""Generate BPA overview PDF for Пульт / шикардорс.рф."""

from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT = Path("/opt/cursor/artifacts/pult-avtomatizaciya-biznes-processov.pdf")
OUT.parent.mkdir(parents=True, exist_ok=True)
# Also copy into repo docs for the project
OUT_REPO = Path("/workspace/docs/pult-avtomatizaciya-biznes-processov.pdf")

pdfmetrics.registerFont(TTFont("DejaVu", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DejaVuBold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))

INK = HexColor("#1a1f1c")
MUTED = HexColor("#5c6560")
ACCENT = HexColor("#0b6b56")
WARM = HexColor("#9a7b4f")
LINE = HexColor("#d8ddd9")
SOFT = HexColor("#eef5f2")
PAPER = HexColor("#f7f6f2")


def styles():
    base = getSampleStyleSheet()
    return {
        "cover_brand": ParagraphStyle(
            "cover_brand",
            fontName="DejaVuBold",
            fontSize=12,
            textColor=ACCENT,
            alignment=TA_CENTER,
            spaceAfter=8,
            tracking=1,
        ),
        "cover_title": ParagraphStyle(
            "cover_title",
            fontName="DejaVuBold",
            fontSize=26,
            leading=32,
            textColor=INK,
            alignment=TA_CENTER,
            spaceAfter=14,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            fontName="DejaVu",
            fontSize=11,
            leading=16,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=6,
        ),
        "h1": ParagraphStyle(
            "h1",
            fontName="DejaVuBold",
            fontSize=16,
            leading=21,
            textColor=INK,
            spaceBefore=4,
            spaceAfter=10,
        ),
        "h2": ParagraphStyle(
            "h2",
            fontName="DejaVuBold",
            fontSize=12.5,
            leading=17,
            textColor=ACCENT,
            spaceBefore=12,
            spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "body",
            fontName="DejaVu",
            fontSize=10,
            leading=15,
            textColor=INK,
            alignment=TA_JUSTIFY,
            spaceAfter=8,
        ),
        "bullet": ParagraphStyle(
            "bullet",
            fontName="DejaVu",
            fontSize=10,
            leading=14,
            textColor=INK,
            leftIndent=2,
            spaceAfter=3,
        ),
        "callout": ParagraphStyle(
            "callout",
            fontName="DejaVu",
            fontSize=10,
            leading=14,
            textColor=INK,
            alignment=TA_LEFT,
        ),
        "table_h": ParagraphStyle(
            "table_h",
            fontName="DejaVuBold",
            fontSize=8.5,
            leading=11,
            textColor=white,
        ),
        "table_c": ParagraphStyle(
            "table_c",
            fontName="DejaVu",
            fontSize=8.5,
            leading=11,
            textColor=INK,
        ),
        "footer": ParagraphStyle(
            "footer",
            fontName="DejaVu",
            fontSize=8,
            textColor=MUTED,
            alignment=TA_CENTER,
        ),
        "caption": ParagraphStyle(
            "caption",
            fontName="DejaVu",
            fontSize=9,
            leading=12,
            textColor=MUTED,
            spaceAfter=10,
        ),
    }


def bullets(items, st):
    return ListFlowable(
        [ListItem(Paragraph(i, st["bullet"]), leftIndent=12, bulletColor=ACCENT) for i in items],
        bulletType="bullet",
        start="•",
        leftIndent=14,
        bulletFontName="DejaVu",
        bulletFontSize=10,
        spaceBefore=2,
        spaceAfter=8,
    )


def callout_box(text, st):
    data = [[Paragraph(text, st["callout"])]]
    t = Table(data, colWidths=[170 * mm])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), SOFT),
                ("BOX", (0, 0), (-1, -1), 0.6, ACCENT),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return t


def matrix_table(rows, st, col_widths):
    data = []
    for i, row in enumerate(rows):
        style = st["table_h"] if i == 0 else st["table_c"]
        data.append([Paragraph(c, style) for c in row])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), ACCENT),
        ("BACKGROUND", (0, 1), (-1, -1), white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, PAPER]),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    t.setStyle(TableStyle(style_cmds))
    return t


def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(MUTED)
    canvas.setFont("DejaVu", 8)
    canvas.drawCentredString(
        A4[0] / 2,
        12 * mm,
        f"Пульт · шикардорс.рф  ·  автоматизация  ·  стр. {doc.page}",
    )
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.4)
    canvas.line(18 * mm, 16 * mm, A4[0] - 18 * mm, 16 * mm)
    canvas.restoreState()


def build():
    st = styles()
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=20 * mm,
        title="Автоматизация бизнес-процессов в Пульте",
        author="Пульт / шикардорс.рф",
    )
    story = []

    # —— Cover ——
    story.append(Spacer(1, 28 * mm))
    story.append(Paragraph("ПУЛЬТ  ·  ШИКАРДОРС.РФ", st["cover_brand"]))
    story.append(
        Paragraph(
            "Автоматизация<br/>бизнес-процессов",
            st["cover_title"],
        )
    )
    story.append(
        Paragraph(
            "Что имеют в виду в Instagram и Telegram,<br/>"
            "как это ложится на салон дверей и на канбан Пульта,<br/>"
            "и что даст максимум эффекта в первую очередь.",
            st["cover_sub"],
        )
    )
    story.append(Spacer(1, 10 * mm))
    story.append(
        callout_box(
            "<b>Коротко:</b> автоматизация — это не «ещё один бот ради галочки». "
            "Это правила, по которым заявка сама двигается по этапам, "
            "менеджер не забывает клиента, склад и монтаж видят заказ вовремя, "
            "а руководитель смотрит на исключения, а не на каждую карточку руками.",
            st,
        )
    )
    story.append(Spacer(1, 14 * mm))
    story.append(
        Paragraph(
            "Документ для Президента и команды · практический план под текущий Пульт",
            st["caption"],
        )
    )
    story.append(PageBreak())

    # —— 1 ——
    story.append(Paragraph("1. О чём вообще этот хайп", st["h1"]))
    story.append(
        Paragraph(
            "В Reels и Telegram-каналах под заголовком «автоматизация бизнеса» обычно "
            "продают одно и то же простыми словами: меньше рутины, меньше потерь лидов, "
            "быстрее ответ клиенту, прозрачный контроль. За красивыми словами стоят "
            "четыре конкретных слоя.",
            st["body"],
        )
    )
    story.append(
        bullets(
            [
                "<b>Сбор заявок</b> — сайт, реклама, Max, Telegram, WhatsApp → одна воронка, без «написали в личку и забыли».",
                "<b>Маршрутизация</b> — кому отдать карточку, в какой блок положить, кого пингануть.",
                "<b>Триггеры и таймеры</b> — «прошло 1 день после КП — двигаем», «срок поставки вышел — красный флаг».",
                "<b>Коммуникации</b> — шаблоны сообщений, напоминания клиенту и команде, эскалация шефу.",
            ],
            st,
        )
    )
    story.append(
        Paragraph(
            "Часто в блогах показывают Make / n8n / Bitrix24 / amoCRM как «магическую коробку». "
            "Суть не в бренде сервиса, а в том, что <b>процесс описан правилами</b>, а система "
            "их исполняет 24/7. У салона дверей процесс длинный: продажа → замер → заказ → "
            "поставка → монтаж → сервис. Именно здесь автоматизация окупается сильнее всего.",
            st["body"],
        )
    )
    story.append(
        callout_box(
            "<b>Важно для шикардорс.рф:</b> у вас уже есть каркас процесса в Пульте — "
            "три направления (Продажа / Поставка / Сервис), десятки блоков как в рабочей "
            "воронке Bitrix, карточка сделки как центр правды, интеграции Max и Сайт в админке. "
            "Автоматизация — это «мозг» поверх этой доски, а не новая CRM с нуля.",
            st,
        )
    )

    # —— 2 ——
    story.append(Paragraph("2. Что именно автоматизируют у салонов и ритейла", st["h1"]))
    story.append(
        Paragraph(
            "Ниже — типичный «набор из инсты», переведённый на язык двери и монтажа.",
            st["body"],
        )
    )
    story.append(
        matrix_table(
            [
                ["Что обещают в контенте", "Что это значит в салоне", "Где в Пульте"],
                [
                    "Лиды не теряются",
                    "Заявка с сайта/рекламы сразу становится карточкой в «Не обработанная»",
                    "Интеграция Сайт → Продажа",
                ],
                [
                    "Автоответ за 1 минуту",
                    "Клиенту уходит шаблон в Max/Telegram: «приняли, менеджер свяжется»",
                    "Интеграция Max + шаблоны",
                ],
                [
                    "Воронка сама двигается",
                    "Таймеры: 1 день / 2 дня после КП, «не выходит на связь»",
                    "Правила переходов + флаги",
                ],
                [
                    "Задачи без забывчивости",
                    "При входе в блок — задача Ксении / Кате / бригаде",
                    "Задачи + assigneeHint блока",
                ],
                [
                    "Контроль сроков",
                    "Просрочка поставки/монтажа → флаг, сигнал на Обзоре",
                    "Флаги, Обзор, архив",
                ],
                [
                    "Отчёты без Excel",
                    "Выручка/отказы за месяц, нагрузка по людям",
                    "Обзор + Архив",
                ],
            ],
            st,
            [48 * mm, 62 * mm, 50 * mm],
        )
    )
    story.append(Spacer(1, 4 * mm))

    # —— 3 ——
    story.append(Paragraph("3. В каком виде это реализовать у нас", st["h1"]))
    story.append(
        Paragraph(
            "Не нужно сразу строить «космический» AI. Для Пульта логичны четыре формата "
            "реализации — от быстрого к сложному. Их можно делать по слоям.",
            st["body"],
        )
    )

    story.append(Paragraph("Формат A — Правила на доске (внутри Пульта)", st["h2"]))
    story.append(
        Paragraph(
            "Самый важный слой. Когда карточка создаётся, меняет блок или проходит N часов — "
            "срабатывает правило: смена этапа, флаг, задача, уведомление. Это прямой аналог "
            "роботов Bitrix / salesbot amo, но заточенный под ваши блоки «Поставка» и «Продажа».",
            st["body"],
        )
    )
    story.append(
        bullets(
            [
                "Триггер: создание / смена блока / таймер / заполнение поля / исход из архива.",
                "Условие: направление, блок, сумма, ответственный, флаг, пустые обязательные поля.",
                "Действие: перенести, назначить, создать задачу, написать в Max, пинг шефу.",
            ],
            st,
        )
    )

    story.append(Paragraph("Формат B — Входящие каналы (Сайт + Max + позже Telegram)", st["h2"]))
    story.append(
        Paragraph(
            "В админке уже заложены Max и Сайт. Автоматизация здесь = любой внешний сигнал "
            "становится карточкой с нужными полями и попадает в правильный блок без копипаста "
            "менеджером. Диалог Max привязан к сделке (как чат в Bitrix).",
            st["body"],
        )
    )

    story.append(Paragraph("Формат C — Шаблоны сообщений и сценарии касаний", st["h2"]))
    story.append(
        Paragraph(
            "Серии касаний после КП, напоминание о замере, «заказ сформирован — согласуем доставку», "
            "опрос качества после монтажа. Это то, что в блогах называют «прогрев» и «дожим», "
            "но у вас это операционные касания, а не маркетинг ради лайков.",
            st["body"],
        )
    )

    story.append(Paragraph("Формат D — Внешний оркестратор (n8n / Make) — по необходимости", st["h2"]))
    story.append(
        Paragraph(
            "Имеет смысл, когда нужно связать Пульт с 1С, складом поставщика, телефонией, "
            "рекламным кабинетом. Ядро процесса лучше держать в Пульте; наружу отдавать "
            "вебхуки «карточка создана / блок сменился / сделка в архиве».",
            st["body"],
        )
    )
    story.append(PageBreak())

    # —— 4 ——
    story.append(Paragraph("4. Что максимально сильно поможет — приоритеты", st["h1"]))
    story.append(
        Paragraph(
            "Ниже — порядок внедрения с максимальной отдачей на рубль времени. "
            "Сначала то, что убирает потери денег и хаос, потом «красивости».",
            st["body"],
        )
    )

    story.append(
        matrix_table(
            [
                ["#", "Инициатива", "Эффект", "Сложность"],
                [
                    "1",
                    "<b>Сайт → карточка в «Не обработанная»</b> + мгновенный пинг ответственному",
                    "Ноль потерянных заявок с шикардорс.рф",
                    "Средняя",
                ],
                [
                    "2",
                    "<b>Таймеры в Продаже</b>: 1 день / 2 дня после КП, «не на связи», эскалация",
                    "Дожим без ручного контроля каждого лида",
                    "Средняя",
                ],
                [
                    "3",
                    "<b>Автозадачи при входе в блок</b> (Ксения, Катя, бригада, Кондря)",
                    "Никто «не увидел» карточку в своём столбце",
                    "Низкая–средняя",
                ],
                [
                    "4",
                    "<b>Просрочки поставки/монтажа → флаг + сигнал на Обзоре</b>",
                    "Президент видит пожары, а не всю доску",
                    "Низкая",
                ],
                [
                    "5",
                    "<b>Max: диалог у сделки + шаблоны</b> на ключевых этапах",
                    "Переписка не размазана по личкам менеджеров",
                    "Средняя–высокая",
                ],
                [
                    "6",
                    "<b>Стоп-факторы выхода из блока</b> (обязательные поля, документы)",
                    "Монтаж не стартует без комплекта",
                    "Средняя",
                ],
                [
                    "7",
                    "<b>Автоархив / причины отказа</b> + отчёт месяца",
                    "Понятно, где теряем деньги",
                    "Низкая (частично есть)",
                ],
                [
                    "8",
                    "Опрос качества / отзыв после монтажа (блоки уже есть)",
                    "Повторные продажи и репутация",
                    "Средняя",
                ],
            ],
            st,
            [10 * mm, 68 * mm, 52 * mm, 30 * mm],
        )
    )
    story.append(Spacer(1, 5 * mm))
    story.append(
        callout_box(
            "<b>Топ-3 «максимально сильно» прямо сейчас:</b><br/>"
            "1) Заявки с сайта в канбан без рук.<br/>"
            "2) Таймерные роботы в Продаже (дожим и эскалация).<br/>"
            "3) Автозадачи + сигналы просрочек для Поставки/Монтажа.<br/><br/>"
            "Эти три пункта закрывают 70% боли, о которой говорят в инфобизнес-роликах, "
            "но в вашей реальной операционке — с дверями, замерами и бригадами.",
            st,
        )
    )

    # —— 5 ——
    story.append(Paragraph("5. Примеры роботов «как будет выглядеть»", st["h1"]))
    story.append(Paragraph("Продажа", st["h2"]))
    story.append(
        bullets(
            [
                "Новая заявка с сайта → блок «Не обработанная» → задача менеджеру → шаблон в Max клиенту.",
                "Действие «КП отправлено» → блок «Отправили предложение» → таймер 24ч → «Прошло 1 день…».",
                "Ещё 24ч без движения → «Прошло 2 дня…» → задача Президенту / старшему.",
                "Пустой телефон/имя при попытке уйти из первого блока → запрет + подсветка полей.",
            ],
            st,
        )
    )
    story.append(Paragraph("Поставка / монтаж", st["h2"]))
    story.append(
        bullets(
            [
                "Перенос в «В обработке у Ксении» → задача Ксении, дедлайн сегодня.",
                "Дата поставки &lt; сегодня и блок ещё «Заказ в работе» → автофлаг + колонка/сигнал «Вышел срок».",
                "Вход в блок бригады → уведомление монтажнику, чек-лист документов.",
                "Закрытие монтажа успехом → предложение карточки в «Опрос по качеству».",
            ],
            st,
        )
    )
    story.append(Paragraph("Сервис", st["h2"]))
    story.append(
        bullets(
            [
                "Обращение из Max с тегом «гарантия» → карточка в «Не обработанная» сервиса.",
                "SLA: 4 часа без взятия в работу → эскалация.",
            ],
            st,
        )
    )

    # —— 6 ——
    story.append(Paragraph("6. Чего не делать (типичные ловушки из блогов)", st["h1"]))
    story.append(
        bullets(
            [
                "Не плодить 40 интеграций до того, как стабильно работают сайт→карточка и таймеры.",
                "Не автоматизировать хаос: сначала блоки и названия совпадают с реальной работой смены.",
                "Не слать клиенту 10 сообщений подряд — только полезные касания по этапу.",
                "Не отдавать ядро воронки в Make, оставляя Пульт «тупой доской» — правила должны жить рядом с карточками.",
                "Не измерять успех числом роботов; мерить: время ответа, % потерянных заявок, просрочки монтажа, конверсия КП→замер→сделка.",
            ],
            st,
        )
    )

    # —— 7 ——
    story.append(Paragraph("7. Как внедрять у нас по этапам", st["h1"]))
    story.append(
        matrix_table(
            [
                ["Этап", "Что делаем в продукте", "Результат для салона"],
                [
                    "Сейчас есть",
                    "Канбан 3 направлений, фильтр блоков, архив, Обзор, заготовки Max/Сайт",
                    "Процесс уже виден и управляем руками",
                ],
                [
                    "Спринт 1",
                    "Движок правил (триггер→условие→действие) + 5–7 роботов Продажи",
                    "Дожим и эскалации без Excel-напоминалок",
                ],
                [
                    "Спринт 2",
                    "Приём заявок с сайта (webhook) + автосоздание карточки",
                    "Лиды с шикардорс.рф не теряются",
                ],
                [
                    "Спринт 3",
                    "Max: связь диалога со сделкой, 5 шаблонов, уведомления о смене блока",
                    "Переписка и канбан в одном контуре",
                ],
                [
                    "Спринт 4",
                    "Автозадачи по блокам Поставки + SLA-флаги на Обзоре",
                    "Исполнение заказа под контролем",
                ],
                [
                    "Далее",
                    "Вебхуки наружу, 1С/склад, телефония — по боли",
                    "Связка с остальным контуром компании",
                ],
            ],
            st,
            [28 * mm, 72 * mm, 60 * mm],
        )
    )
    story.append(Spacer(1, 6 * mm))

    # —— 8 ——
    story.append(Paragraph("8. Вывод", st["h1"]))
    story.append(
        Paragraph(
            "«Автоматизация бизнес-процессов» из Instagram — это в сущности "
            "<b>дисциплина процесса + роботы на этапах</b>. У шикардорс.рф уже есть правильная "
            "операционная модель в Пульте. Следующий шаг — не менять CRM, а нарастить "
            "правила: вход заявок, таймеры продажи, задачи и сигналы на поставке, Max у карточки.",
            st["body"],
        )
    )
    story.append(
        callout_box(
            "<b>Формула для Президента:</b> Пульт = доска правды. Автоматизация = "
            "чтобы доска двигалась сама там, где люди сейчас забывают, опаздывают "
            "или копируют данные руками. Начните с сайта→карточка и таймеров КП — "
            "это самый короткий путь к деньгам.",
            st,
        )
    )
    story.append(Spacer(1, 8 * mm))
    story.append(
        Paragraph(
            "Файл можно использовать как бриф для разработки следующих спринтов Пульта.",
            st["caption"],
        )
    )

    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    OUT_REPO.write_bytes(OUT.read_bytes())
    print(OUT)
    print(OUT_REPO)
    print("bytes", OUT.stat().st_size)


if __name__ == "__main__":
    build()
