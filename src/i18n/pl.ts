/**
 * Polish. The shape is `en.ts`; every key here is one there.
 *
 * Written from knowledge of the language and not yet read by a native speaker,
 * the same caveat the stopword lists carry. "Ty" throughout.
 *
 * Polish counts in three forms: one `słowo`, two to four `słowa`, five and up
 * `słów`, with the teens going the long way. `plural` below is that rule, and
 * every count on this screen goes through it.
 */
import { Platform } from 'react-native';

import { DOWNLOADED_LANGUAGES, type Language } from '../domain';
import { joinNames, type Copy } from './en';

const STORE = Platform.OS === 'ios' ? 'App Store' : 'Google Play';
const STORE_IN = Platform.OS === 'ios' ? 'w App Store' : 'w Google Play';

/** `one` for 1, `few` for 2–4 outside the teens, `many` for the rest. */
function plural(count: number, one: string, few: string, many: string): string {
  const tens = count % 100;
  const units = count % 10;
  if (count === 1) return `${count} ${one}`;
  if (units >= 2 && units <= 4 && (tens < 12 || tens > 14)) return `${count} ${few}`;
  return `${count} ${many}`;
}

const languageNames: Record<Language, string> = {
  en: 'Angielski',
  nl: 'Niderlandzki',
  fr: 'Francuski',
  de: 'Niemiecki',
  id: 'Indonezyjski',
  it: 'Włoski',
  pl: 'Polski',
  pt: 'Portugalski',
  es: 'Hiszpański',
};

const NUMBER_WORDS = ['zero', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć', 'dziesięć', 'jedenaście', 'dwanaście'];
const moreCount = NUMBER_WORDS[DOWNLOADED_LANGUAGES.length] ?? String(DOWNLOADED_LANGUAGES.length);
const moreNames = joinNames(
  DOWNLOADED_LANGUAGES.map((language) => languageNames[language.code].toLowerCase()),
  'i'
);
/** "osiem języków", "ośmiu języków": the genitive is what "wszystkie" wants. */
const moreCountGenitive = DOWNLOADED_LANGUAGES.length === 8 ? 'ośmiu' : moreCount;

export const pl: Copy = {
  languageNames,

  common: {
    back: 'Wstecz',
    cancel: 'Anuluj',
    ok: 'OK',
    notNow: 'Nie teraz',
    delete: 'Usuń',
    keep: 'Zostaw',
    done: 'Gotowe',
    save: 'Zapisz',
    home: 'Start',
    retry: 'Spróbuj ponownie',
    close: 'Zamknij',
    play: 'Odtwórz',
    pause: 'Pauza',
    seePro: 'Zobacz Pro',
    words: (count) => plural(count, 'słowo', 'słowa', 'słów'),
    dateUnknown: 'data nieznana',
  },

  welcome: {
    headline: 'Napisy, które wyglądają jak zmontowane.',
    blurb: 'Dodaj napisy do jednego klipu albo ustaw dwadzieścia w kolejce i pozwól telefonowi pracować.',
    yourLanguage: 'Twój język',
    languageNote: 'Dla aplikacji i dla filmów, do których dodajesz napisy. Oba zmienisz później w Ustawieniach.',
    start: 'Zaczynamy',
    restore: 'Masz już subskrypcję? Przywróć',
    nothingFound: 'Nie znaleziono subskrypcji ani zakupu dla tego konta.',
  },

  home: {
    blurb: 'Dodaj napisy do jednego klipu albo do całej serii.',
    newVideo: 'Nowy film',
    settings: 'Ustawienia',
    onThisPhone: 'Na tym telefonie',
    deleteTitle: 'Usunąć ten projekt?',
    deleteBody: (project) => `${project}\n\nTranskrypcja zniknie razem z nim. Film na telefonie zostaje nietknięty.`,
    stopped: 'Transkrypcja przerwana',
    tapToRetry: 'dotknij, by spróbować ponownie',
    ready: 'gotowe',
    couldNotOpen: 'Nie udało się otworzyć tego filmu',
    couldNotOpenMany: 'Nie udało się otworzyć tych filmów',
    curtainTitle: 'Przygotowuję Twój film',
    curtainNote: 'Długi klip zajmuje kilka sekund.',
    qaBuild: 'Build QA',
    proOverride: (what) => `Wymuszone Pro: ${what}`,
  },

  freeVideos: {
    title: 'Darmowe filmy zostały wykorzystane',
    body: 'Wordburn Pro dodaje napisy do dowolnej liczby filmów, bez znaku wodnego. Filmy, które już masz z napisami, zostają tu do edycji i eksportu.',
  },

  tier: {
    onHold: `Pro jest wstrzymane: zaktualizuj płatność ${STORE_IN}`,
    fixIt: 'Napraw',
    freeVideosUsed: 'Darmowe filmy wykorzystane',
    freeVideosLeft: (left, watermarked) =>
      `Zostało: ${plural(left, 'darmowy film', 'darmowe filmy', 'darmowych filmów')}${watermarked ? ' · eksport ze znakiem wodnym' : ''}`,
    watermark: 'Darmowe eksporty mają mały znak wodny',
    trialEnded: 'Okres próbny się skończył',
    trialLastDay: 'Ostatni dzień okresu próbnego',
    trialDaysLeft: (days) => `Zostało ${plural(days, 'dzień', 'dni', 'dni')} okresu próbnego`,
    freeExportsUsed: 'Darmowe eksporty wykorzystane',
    freeExportsLeft: (left) => `Zostało: ${plural(left, 'darmowy eksport', 'darmowe eksporty', 'darmowych eksportów')}`,
  },

  pro: {
    name: 'Wordburn Pro',
    headline: 'Napisy do każdego klipu, nie tylko jednego.',
    lede: 'Ustaw serię klipów w kolejce i wyeksportuj je bez znaku wodnego.',
    benefits: [
      'Napisy do dowolnej liczby filmów',
      'Żadnego znaku wodnego na eksportach',
      'Napisy seryjne: do 20 klipów w kolejce, jeden styl dla wszystkich',
      'Nielimitowane słowa w słowniku',
    ],
    plan: {
      weekly: 'Tygodniowy',
      monthly: 'Miesięczny',
      yearly: 'Roczny',
    },
    yourPlan: 'Twój',
    bestValue: 'Najkorzystniej',
    save: (percent) => `Oszczędzasz ${percent}%`,
    perMonth: (amount) => `${amount} / mies.`,
    perPeriod: { week: 'tygodniowo', month: 'miesięcznie', year: 'rocznie' },
    trialBadge: (days) => `${plural(days, 'dzień', 'dni', 'dni')} za darmo`,
    cta: (trialDays) => (trialDays ? `Wypróbuj ${plural(trialDays, 'dzień', 'dni', 'dni')} za darmo` : 'Dalej'),
    fineprint: (price, period, trialDays) =>
      trialDays
        ? `Za darmo przez ${plural(trialDays, 'dzień', 'dni', 'dni')}, potem ${price} ${period}. Odnawia się automatycznie. Anuluj w dowolnej chwili ${STORE_IN}, co najmniej dzień przed końcem okresu próbnego, a nic nie zostanie pobrane.`
        : `${price} ${period}. Odnawia się automatycznie, dopóki nie anulujesz – w dowolnej chwili ${STORE_IN}.`,
    restore: 'Przywróć zakupy',
    terms: 'Regulamin',
    privacy: 'Prywatność',
    retry: 'Spróbuj ponownie',
    pending: 'Czekam na potwierdzenie płatności. Możesz to zamknąć: Pro włączy się samo, gdy płatność przejdzie.',
    nothingToRestore: 'Nie znaleziono subskrypcji ani zakupu dla tego konta.',
    goodwill:
      'Wordburn tworzy jeden niezależny deweloper. Twoje wsparcie to więcej czasu na ulepszanie aplikacji, poprawianie drobiazgów i robienie jej coraz lepszą. Dziękuję.',
    simulatedTitle: 'Symulowany zakup',
    simulatedBody: 'Nie ma tu Google Play: Pro jest włączone przez nadpisanie deweloperskie. Ustawienia → Deweloper je wyłącza.',
    active: {
      title: 'Masz Pro',
      lifetime: 'Każda funkcja Pro jest włączona na tym koncie.',
      renewing: (plan) => `Plan ${plan.toLowerCase()}. Zarządzaj nim lub anuluj ${STORE_IN}.`,
      ending: (plan) => `Plan ${plan.toLowerCase()}, anulowany. Pro działa do końca opłaconego okresu.`,
      unverified: `Nie udało się połączyć z ${STORE}, więc to ostatnia znana odpowiedź.`,
      manage: 'Zarządzaj subskrypcją',
      home: 'Start',
      backToExport: 'Wróć do eksportu',
      continue: 'Dalej',
      back: 'Wstecz',
    },
    hold: {
      title: 'Pro jest wstrzymane',
      body: `${STORE} nie mógł pobrać ostatniej płatności albo plan jest wstrzymany. Załatw to ${STORE_IN}, a Pro wróci od razu.`,
      fix: `Otwórz ${STORE}`,
    },
    upsell: 'Przejdź na Pro',
  },

  store: {
    unreachable:
      Platform.OS === 'android'
        ? 'Nie udało się połączyć z Google Play na tym telefonie. Sprawdź połączenie i spróbuj ponownie.'
        : 'Nie udało się połączyć z App Store. Sprawdź połączenie i spróbuj ponownie.',
    nothing:
      Platform.OS === 'android'
        ? 'Google Play jeszcze nie oferuje Wordburn Pro dla Twojego konta. Spróbuj później.'
        : 'App Store jeszcze nie oferuje Wordburn Pro dla Twojego konta. Spróbuj później.',
    didNotFinish: 'Sklep nie dokończył operacji.',
  },

  settings: {
    title: 'Ustawienia',
    yourWords: 'Twoje słowa',
    nothingYet: 'Jeszcze nic',
    pro: 'Wordburn Pro',
    proDetail: {
      free: 'Darmowy',
      lifetime: 'Pro',
      subscribed: (plan) => `Plan ${plan.toLowerCase()}`,
      suspended: 'Wstrzymane: zaktualizuj płatność',
    },
    defaultStyle: 'Domyślny styl napisów',
    appLanguage: 'Język aplikacji',
    feedback: 'Prześlij opinię',
    feedbackDetail: 'E-mail lub TikTok',
    about: 'O aplikacji',
    developer: 'Deweloper',
    onDevice: 'Przetwarzanie odbywa się na Twoim urządzeniu.',
    aboutPrivacy: 'Twoje filmy, dźwięk i transkrypcje nigdy nie są wysyłane i nie ma żadnego konta.',
    aboutFonts: 'Złożone krojami Be Vietnam Pro i Spectral, oba na licencji SIL Open Font License.',
    aboutWhisper: 'Rozpoznawanie mowy: whisper.cpp, licencja MIT.',
  },

  appLanguage: {
    title: 'Język aplikacji',
    note: 'Język, w którym Wordburn do Ciebie mówi. Język Twoich filmów wybierasz na ekranie startowym, dla każdego klipu.',
  },

  languages: {
    fieldLabel: 'Język mówiony',
    sheetTitle: 'W jakim języku mówi się w tym filmie?',
    sheetNote: 'Napisy są pisane w języku, w którym się mówi. Wordburn nie tłumaczy.',
    group: {
      builtIn: 'Wbudowane w aplikację',
      download: (size) => `Jedno pobranie ${size} dla wszystkich ${moreCountGenitive}`,
      ready: 'Pobrane · gotowe do użycia',
    },
    mixedHint: 'Mówisz po angielsku i w innym języku w tym samym filmie? Wybierz ten drugi język.',
    downloading: (percent) => `Pobieranie ${percent}%`,
    notNow: 'Nie teraz',
    downloadTitle: `Pobrać ${moreCount} kolejnych języków?`,
    downloadBody: (size) =>
      `Żeby dodawać napisy w językach: ${moreNames}, Wordburn potrzebuje jednorazowego pobrania ${size}. Obejmuje wszystkie ${moreCountGenitive}. Użyj Wi-Fi, jeśli możesz.`,
    download: 'Pobierz',
    stillDownloading: 'Języki wciąż się pobierają',
    lowMemoryTitle: 'Niedostępne na tym telefonie',
    stillDownloadingBody: 'Będą gotowe za kilka minut. W tym czasie możesz dalej używać Wordburn po angielsku.',
    failed: 'Pobieranie nie zakończyło się',
    retry: 'Spróbuj ponownie',
    settingsTitle: 'Języki',
    settingsDetail: {
      ready: (size) => `Pobrane · ${size}`,
      absent: 'Tylko angielski',
      downloading: (percent) => `Pobieranie ${percent}%`,
    },
    manage: {
      title: 'Języki',
      english: 'Angielski jest wbudowany w aplikację.',
      model: joinNames(DOWNLOADED_LANGUAGES.map((language) => languageNames[language.code]), 'i'),
      modelNote: (size) =>
        `Te języki wymagają jednorazowego pobrania ${size}. Twoje filmy zostają na telefonie.`,
      remove: 'Usuń pobrane',
      removeTitle: 'Usunąć te języki?',
      removeBody: (size) =>
        `Zwolni to ${size}. Filmy, które już mają napisy, je zachowają. Języki możesz pobrać ponownie w dowolnej chwili.`,
      cancel: 'Zatrzymaj pobieranie',
    },
    notEnoughMemory: 'Ten telefon nie ma dość pamięci na języki inne niż angielski. Angielski nadal działa.',
    needsSpace: (size) =>
      `Potrzeba ${size} wolnego miejsca i trochę więcej na Twoje filmy. Zwolnij miejsce i spróbuj ponownie.`,
    notWhole: 'Pobranie nie dotarło w całości. Spróbuj ponownie, przez Wi-Fi, jeśli możesz.',
    stopped: 'Pobieranie się zatrzymało. Sprawdź połączenie i spróbuj ponownie, przez Wi-Fi, jeśli możesz.',
    modelMissing: (language) =>
      `Modelu dla języka ${language.toLowerCase()} nie ma na tym telefonie. Pobierz go w Ustawienia → Języki i spróbuj ponownie.`,
    serviceTitle: 'Pobieranie języków',
  },

  looks: {
    save: 'Zapisz styl',
    title: 'Nazwij ten styl',
    note: 'Zapisane style można wybrać dla całej serii. Zajęta nazwa zostaje nadpisana.',
    placeholder: 'Mój styl podcastowy',
    confirm: 'Zapisz',
    cancel: 'Anuluj',
    saved: (name) => `Zapisano jako „${name}”`,
  },

  batch: {
    home: 'Seria',
    homeNote: 'Do 20 klipów',
    proTitle: 'Napisy seryjne są częścią Wordburn Pro',
    proBody: 'Ustaw do 20 klipów w kolejce, wybierz jeden język i jeden styl, i pozwól telefonowi pracować.',
    busyTitle: 'Seria wciąż trwa',
    busyBody: 'Pozwól jej się skończyć albo wyczyść kolejkę, zanim zaczniesz kolejną.',
    viewQueue: 'Zobacz kolejkę',
    setupTitle: 'Nowa seria',
    clips: (count) => plural(count, 'klip', 'klipy', 'klipów'),
    totalLength: (label) => `${label} filmu`,
    tooMany: (max) => `Do kolejki trafia tylko ${plural(max, 'pierwszy klip', 'pierwsze klipy', 'pierwszych klipów')}.`,
    style: 'Styl dla każdego klipu',
    currentLook: 'Twój domyślny styl',
    savedLooks: 'Zapisane style',
    presets: 'Szablony',
    start: (count) => `Dodaj napisy: ${plural(count, 'klip', 'klipy', 'klipów')}`,
    galleryDenied: 'Wordburn musi móc zapisywać filmy w galerii, żeby wyeksportować serię.',
    queueTitle: 'Kolejka',
    summary: (done, total) => `${done} z ${total} gotowe`,
    failedCount: (failed) => `${failed} nieudane`,
    status: {
      queued: 'Czeka',
      transcribing: 'Transkrypcja',
      rendering: 'Renderowanie',
      done: 'Zapisano w galerii',
      failed: 'Nieudane',
    },
    paused: {
      user: 'Wstrzymane',
      storage: 'Wstrzymane: w telefonie kończy się miejsce. Zwolnij trochę i wznów.',
      heat: 'Czekam, aż telefon ostygnie. Wznowi się samo.',
    },
    pause: 'Wstrzymaj',
    resume: 'Wznów',
    retry: 'Ponów',
    open: 'Otwórz',
    clear: 'Wyczyść zakończoną serię',
    empty: 'Kolejka jest pusta.',
    finished: 'Wszystko gotowe. Każdy klip jest w galerii, w albumie Wordburn.',
    homeRow: (done, total) => `Seria · ${done} z ${total} gotowe`,
    homeRowPaused: 'Seria wstrzymana',
    transcriptionDidNotFinish: 'Transkrypcja nie została ukończona.',
    projectGone: 'Projekt zniknął.',
    serviceTitle: 'Dodaję napisy do klipów',
    serviceProgress: (current, total) => `Napisy: ${current} z ${total}`,
  },

  defaultStyle: {
    title: 'Domyślny styl',
    onboardingTitle: 'Wybierz styl napisów',
    continue: 'Dalej',
    note: 'Każdy nowy film i seria zaczyna się w tym stylu. Słowa powyżej to przykład – zmiana tutaj nie dotyka filmów, które już mają napisy.',
    onboardingNote: 'Każdy film i seria zacznie się w tym stylu, więc ustawiasz go raz. Zmienisz go w dowolnej chwili w Ustawienia → Domyślny styl.',
  },

  processing: {
    stage: {
      queued: 'Przygotowuję',
      extracting: 'Pobieram dźwięk',
      transcribing: 'Transkrypcja',
      aligning: 'Dopasowuję słowa',
      ready: 'Gotowe',
      paused: 'Wstrzymane – zostaw aplikację otwartą, żeby dokończyć',
      failed: 'Coś poszło nie tak',
    },
    gone: 'Ten projekt zniknął',
    backHome: 'Wróć na Start',
    aboutLeft: (time) => `Zostało około ${time}`,
    seconds: (s) => `${s} s`,
    minutes: (m, s) => `${m} min ${s} s`,
    tapToPlay: 'Dotknij, by odtworzyć',
    listening: 'Nasłuchuję pierwszych słów',
    cancel: 'Anuluj',
    serviceTitle: 'Dodaję napisy do filmu',
  },

  editor: {
    back: 'Wstecz',
    export: 'Eksportuj',
    undo: 'Cofnij',
    redo: 'Ponów',
    undoStep: (label) => `Cofnij: ${label.toLowerCase()}`,
    redoStep: (label) => `Ponów: ${label.toLowerCase()}`,
    fullScreen: 'Pełny ekran',
    exitFullScreen: 'Wyjdź z pełnego ekranu',
    toCheck: (count) => `${count} do sprawdzenia`,
    wordsToCheck: (count) => `${plural(count, 'słowo', 'słowa', 'słów')} do sprawdzenia`,
    style: 'Styl',
    shiftAll: 'Przesuń wszystko',
    shiftAllCaptions: 'Przesuń wszystkie napisy',
    fixWithYourWords: (count) => `Popraw ${count} swoimi słowami`,
    cantPlay: 'Nie udało się odtworzyć tego filmu na tym telefonie. Spróbuj innego pliku.',
    noWords: 'Ten projekt nie ma jeszcze słów.',
    notSure: (word) => `${word}, nie ma pewności co do tego`,
    coach: 'Słowa z kropkami to te, co do których rozpoznawanie nie miało pewności. Dotknij jednego, by je poprawić.',
    showMe: 'Pokaż',
    gone: 'Ten projekt zniknął',
    backHome: 'Wróć na Start',
    missingTitle: 'Nie można znaleźć tego filmu',
    missingBody: (words) =>
      `Pliku, z którego powstał ten projekt, nie ma już na telefonie. Twoje ${words} są bezpieczne: wybierz ten sam film jeszcze raz, a napisy wrócą razem z nim.`,
    chooseAgain: 'Wybierz film ponownie',
    deleteProject: 'Usuń projekt',
    deleteTitle: 'Usunąć ten projekt?',
    deleteBody: (project) => `${project}\n\nTranskrypcja zniknie razem z nim. Tego nie da się cofnąć.`,
    couldNotUse: 'Nie udało się użyć tego filmu',
    couldNotOpen: 'Nie udało się otworzyć tego filmu',
    differentTitle: 'To wygląda na inny film',
    differentBody: (projectLength, pickedLength) =>
      `Napisy są zgrane z klipem o długości ${projectLength}, a ten ma ${pickedLength}. Nie będą pasować.`,
    pickAnother: 'Wybierz inny',
    useAnyway: 'Użyj mimo to',
    step: {
      timing: 'Czas',
      shiftCaptions: 'Przesunięcie napisów',
      useYourWord: 'Użycie Twojego słowa',
      useYourWords: 'Użycie Twoich słów',
      fixWords: (count) => `Poprawienie: ${plural(count, 'słowo', 'słowa', 'słów')}`,
      editWord: 'Edycja słowa',
      joinWords: 'Połączenie słów',
      makeBig: 'Powiększenie',
      makeNormal: 'Zwykły rozmiar',
      looksRight: 'Zatwierdzenie',
      lineBreak: 'Podział wiersza',
      deleteWord: 'Usunięcie słowa',
    },
    driftTitle: 'Ta zmiana przesunęła czas',
    driftBody: (label, reason) => `${label}: ${reason}. Zmiana nie została zastosowana.`,
    spillTitle: 'Ta zmiana czasu sięgnęła za daleko',
    spillBody: (label, reason) => `${label}: ${reason}. Nie została zastosowana.`,
    touchedTitle: 'Ta zmiana dotknęła słów',
    touchedBody: (label) => `${label} przesuwa tylko offset. Nie została zastosowana.`,
  },

  wordSheet: {
    playAgain: (word) => `Odtwórz „${word}” jeszcze raz`,
    play: 'Odtwórz',
    save: 'Zapisz',
    done: 'Gotowe',
    fixMore: (count) => `Popraw jeszcze ${count} takich`,
    spaceSplits: 'Spacja dzieli słowo na dwa.',
    edit: 'Edytuj',
    timing: 'Czas',
    timingFor: (word) => `Czas słowa ${word}`,
    makeBig: 'Powiększ',
    makeNormal: 'Zwykły rozmiar',
    addToWords: 'Dodaj do swoich słów',
    addToWordsFor: (word) => `Dodaj ${word} do swoich słów`,
    looksRight: 'Jest dobrze',
    lineBreak: 'Podział wiersza',
    noLineBreak: 'Bez podziału wiersza',
    joinNext: 'Połącz z następnym',
    deleteWord: 'Usuń słowo',
    notSure: 'Nie ma pewności co do tego',
    madeBigAuto: 'powiększone automatycznie',
    madeBig: 'powiększone',
    byDictionary: 'zmienione przez Twój słownik',
  },

  timing: {
    title: 'Czas',
    apply: 'Zastosuj',
    start: 'Początek',
    end: 'Koniec',
    move: 'Przesuń',
    earlier: (label, ms) => `${label} ${ms} milisekund wcześniej`,
    later: (label, ms) => `${label} ${ms} milisekund później`,
    loopThisWord: 'Zapętl to słowo',
    looping: 'Zapętlone',
    loop: 'Zapętl',
    cancel: 'Anuluj',
    noWaveform: 'Brak przebiegu dźwięku dla tego projektu. Przyciski i pętla nadal działają.',
  },

  shift: {
    title: 'Przesuń wszystkie napisy',
    note: 'Wszystkie napisy przesuwają się razem. Słowa zachowują czasy, w których zostały wypowiedziane.',
    apply: 'Zastosuj',
    earlier: (ms) => `Napisy ${ms} milisekund wcześniej`,
    later: (ms) => `Napisy ${ms} milisekund później`,
    atZero: 'Napisy pojawiają się tam, gdzie słychać słowa',
    landLater: 'Napisy pojawiają się później',
    landEarlier: 'Napisy pojawiają się wcześniej',
    cancel: 'Anuluj',
  },

  stylePicker: {
    title: 'Styl',
    note: 'Przerywana ramka to obszar, którego żadna platforma nie zasłania.',
    done: 'Gotowe',
    colour: 'Kolor',
    highlight: 'Wyróżnienie',
    text: 'Tekst',
    colourOf: (target) => `Kolor: ${target.toLowerCase()}`,
    swatch: (target, hex) => `Kolor ${target.toLowerCase()} ${hex}`,
    customColour: 'Własny kolor wyróżnienia',
    size: 'Rozmiar',
    sizeHint: 'Przeciągnij do dowolnego rozmiaru albo dotknij S, M lub L.',
    captionSize: 'Rozmiar napisów',
    sizeValue: (px) => `${px} pikseli na filmie 1080 na 1920`,
    position: 'Pozycja',
    positionHint: 'Dotknij lub przeciągnij w kadrze, by umieścić je gdziekolwiek.',
    captionPosition: 'Pozycja napisów',
    positionValue: (percent) => `${percent}% od góry kadru`,
    upper: 'Góra',
    middle: 'Środek',
    lower: 'Dół',
    wordsPerLine: 'Słów w wierszu',
    fewer: 'Mniej',
    more: 'Więcej',
    presets: {
      readalong: 'Czytaj razem',
      box: 'Ramka',
      karaoke: 'Wypełnienie karaoke',
      clean: 'Czyste napisy',
      stack: 'Stos słów',
      headline: 'Nagłówek',
      newsprint: 'Gazeta',
      bold: 'Mocna żółć',
      clarity: 'Przejrzystość',
      negative: 'Negatyw',
      neonglow: 'Neonowa poświata',
      rocket: 'Rakieta',
    },
  },

  export: {
    title: 'Eksport',
    gone: 'Ten projekt zniknął',
    backHome: 'Wróć na Start',
    galleryTitle: 'Wordburn nie ma dostępu do galerii',
    galleryBody: 'Zezwól na zapisywanie filmów w Ustawieniach, a eksport trafi do galerii.',
    spaceTitle: 'Za mało miejsca na ten eksport',
    spaceBody: (needed, free) =>
      `Potrzeba około ${needed}, a wolne jest ${free}. Zwolnij miejsce albo spróbuj 720p w Opcjach.`,
    failedTitle: 'Ten eksport nie został ukończony',
    reading: 'Odczytuję film',
    withWatermark: 'ze znakiem wodnym',
    noWatermark: 'bez znaku wodnego',
    notOnIphone: 'Eksport nie jest jeszcze dostępny na iPhonie',
    progress: (percent) => `${percent}% · możesz wyjść z aplikacji`,
    cancel: 'Anuluj',
    unlockToExport: 'Odblokuj, by eksportować',
    saveToGallery: 'Zapisz w galerii',
    options: 'Opcje',
    alsoSrt: 'Zapisz też .srt',
    outOfSpace: 'W telefonie skończyło się miejsce podczas zapisu. Zwolnij trochę i spróbuj ponownie.',
    couldNotRender: 'Nie udało się wyrenderować tego filmu na tym telefonie. Spróbuj 720p.',
    notBuiltIos: 'Eksport nie jest jeszcze dostępny na iPhonie.',
    serviceTitle: 'Renderuję napisy',
  },

  saved: {
    title: 'Zapisano w galerii',
    renderedIn: (seconds) => `wyrenderowano w ${seconds} s`,
    srtIn: (file, place) => `${file} jest w ${place}`,
    placeIos: 'Plikach, w Na moim iPhonie › Wordburn',
    placeAndroid: 'folderze Pobrane',
    share: 'Udostępnij',
    backToEditor: 'Wróć do edytora',
    home: 'Start',
    nothingToShareTitle: 'Nie ma czym udostępnić',
    nothingToShareBody: 'Na tym telefonie nie ma aplikacji, która przyjmie film.',
    couldNotShare: 'Nie udało się udostępnić',
  },

  feedback: {
    title: 'Prześlij opinię',
    blurb: 'Podziel się pomysłami, sugestiami albo czymkolwiek, co Twoim zdaniem ulepszyłoby Wordburn. Czytam każdą wiadomość.',
    prompt: 'Co działa dobrze? Co mogłoby być lepsze? Jakie funkcje chcesz zobaczyć?',
    emailMe: 'Napisz e-mail',
    dmTiktok: 'DM na TikToku',
    notNow: 'Nie teraz',
    keepSubject: (tag) => `Zostaw „${tag}” w temacie, a na pewno to zauważę.`,
    noMailTitle: 'Brak skonfigurowanej aplikacji pocztowej',
    noMailBody: (email, subject) => `Wyślij na ${email}, z tematem „${subject}”.`,
    noMailShort: (email) => `Wyślij na ${email}.`,
    tiktokFailed: 'TikTok się nie otworzył',
    tiktokHandle: (handle) => `Konto to @${handle}.`,
    email: 'E-mail',
    tiktok: 'TikTok',
    cancel: 'Anuluj',
  },

  dictionary: {
    title: 'Twoje słowa',
    addWord: 'Dodaj słowo',
    emptyTitle: 'Jeszcze nie ma słów',
    emptyBody: 'Popraw słowo w edytorze i dodaj je tutaj, a każdy kolejny film zapisze je dobrze za pierwszym razem.',
    editEntry: (word) => `Edytuj ${word}`,
    nothingHeard: 'Jeszcze nic nie usłyszano',
    heardAs: (variants) => `usłyszane jako ${variants}`,
    deleted: (word) => `Usunięto „${word}”`,
    undo: 'Cofnij',
    foot: 'Używane w każdym nowym filmie. Tak poprawione słowa są oznaczone w transkrypcji.',
    footFree: (used, max) => `${used} z ${max} za darmo.`,
    capTitle: (max) => `Darmowa lista mieści ${plural(max, 'słowo', 'słowa', 'słów')}`,
    capBody: 'Wordburn Pro znosi limit. Twoje słowa i tak zostają.',
    goPro: 'Przejdź na Pro',
    newWord: 'Nowe słowo',
    save: 'Zapisz',
    spelling: 'Pisownia',
    spellingPlaceholder: 'KitVerify',
    heardAsLabel: 'Usłyszane jako',
    removeVariant: (variant) => `Usuń ${variant}`,
    variantPlaceholder: 'co rozpoznawanie pisze zamiast tego',
    add: 'Dodaj',
    delete: 'Usuń',
    cancel: 'Anuluj',
  },
};
