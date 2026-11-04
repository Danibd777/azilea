// Shared product data for the hero showcase and the collection grid.
// TEMPORARY: product photos are Unsplash images cut out with Higgsfield.
// When Azilea's own photos arrive, cut them out the same way and replace `img`.
(() => {
  window.AZILEA_PRODUCTS = [
    {
      id: 'shabbat-pair', cat: 'shabbat', icon: 'candle',
      title: 'פמוטי שבת',
      text: 'זוג פמוטים לנרות שבת ארוכים. נוצקים כזוג, כדי לעמוד תמיד אחד ליד השני.',
      tags: ['זוג', 'נרות ארוכים', 'בטון שנהב'],
      img: 'assets/products/linen/shabbat-pair.jpg',
    },
    {
      id: 'candle-vessel', cat: 'shabbat', icon: 'flame',
      title: 'נר בכלי בטון',
      text: 'נר שנוצק בתוך כלי בטון לבן. כשהנר נגמר, הכלי נשאר על המדף.',
      tags: ['בטון לבן', 'נר בפנים', 'כלי לשימוש חוזר'],
      img: 'assets/products/linen/candle-vessel.jpg',
    },
    {
      id: 'gypsophila-vase', cat: 'home', icon: 'sprig',
      title: 'כד גיבסנית',
      text: 'כד נמוך בגוון חום עמוק, עם זר גיבסנית מיובשת שנשאר יפה שבועות.',
      tags: ['גיבסנית יבשה', 'גוון אדמה', 'זר מוכן'],
      img: 'assets/products/linen/gypsophila-vase.jpg',
    },
    {
      id: 'ribbed-vase', cat: 'home', icon: 'wheat',
      title: 'אגרטל מצולע',
      text: 'אגרטל לבן עם קווים אנכיים, לזר יבש בגוונים חמים.',
      tags: ['לבן מט', 'מצולע', 'זר שיבולים'],
      img: 'assets/products/linen/ribbed-vase.jpg',
    },
    {
      id: 'concrete-pot', cat: 'home', icon: 'leaf',
      title: 'עציץ בטון',
      text: 'עציץ קטן ויציב מבטון חשוף, לצמח ראשון בבית חדש.',
      tags: ['בטון חשוף', 'קטן', 'מתנה לבית חדש'],
      img: 'assets/products/concrete-pot.png', pending: true, // waiting for its linen-set photo
    },
    {
      id: 'trio-vessels', cat: 'home', icon: 'vessel',
      title: 'שלישיית כדים',
      text: 'שלושה כדים בגבהים שונים, בגימור אבן מחוספס. יחד הם ממלאים מדף שלם.',
      tags: ['סט של שלושה', 'גימור מחוספס', 'גוון חול'],
      img: 'assets/products/trio-vessels.png', pending: true, // waiting for its linen-set photo
    },
  ];

  window.AZILEA_CAT_LABEL = { shabbat: 'שבת', home: 'בית' };
  window.AZILEA_ICONS = {
    candle: '<path d="M9.5 10.5h5V21h-5z"/><path d="M12 8c-1.3-.9-1.5-2.3-.6-3.8.3 1 1.6 1.4 1.6 2.6 0 .7-.4 1-1 1.2z"/>',
    flame: '<path d="M12 21c-3.3 0-5.5-2.2-5.5-5.2 0-3.3 3-5.1 3.4-8.3 2.6 1.6 3.6 3.8 3.4 5.6 1-.6 1.6-1.6 1.8-2.6 1.4 1.4 2.4 3.2 2.4 5.3 0 3-2.2 5.2-5.5 5.2z"/>',
    sprig: '<path d="M12 21V9"/><circle cx="12" cy="6.5" r="1.6"/><circle cx="8.3" cy="9" r="1.4"/><circle cx="15.7" cy="9" r="1.4"/><circle cx="9" cy="5" r="1.1"/><circle cx="15" cy="5" r="1.1"/><path d="M12 13l-3-3M12 13l3-3"/>',
    wheat: '<path d="M12 21V6"/><path d="M12 9c-2-.3-3-1.6-3-3.3 2 .2 3 1.5 3 3.3zM12 9c2-.3 3-1.6 3-3.3-2 .2-3 1.5-3 3.3zM12 13c-2-.3-3-1.6-3-3.3 2 .2 3 1.5 3 3.3zM12 13c2-.3 3-1.6 3-3.3-2 .2-3 1.5-3 3.3z"/><path d="M12 6c0-1.4.6-2.3 1-3"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14-.5 9-5.5 14-13 14z"/><path d="M5 19c3-4 6-7 10-10"/>',
    vessel: '<path d="M9 3.5h6M9.8 3.5c0 2-3.3 3.3-3.3 8.2 0 5.2 2.4 8.8 5.5 8.8s5.5-3.6 5.5-8.8c0-4.9-3.3-6.2-3.3-8.2"/>',
  };
  window.AZILEA_WA = '<path d="M3.6 20.4l1.2-4.3a8.6 8.6 0 1 1 3.3 3.2z"/><path class="fill" d="M9.2 7.9c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5a6.4 6.4 0 0 0 2.6 2.4c.2.1.4.1.5 0l.6-.7c.2-.2.3-.2.5-.1l1.7.8c.2.1.3.2.3.4 0 .5-.2 1.1-.6 1.4-.6.4-1.4.6-2.3.3a9.6 9.6 0 0 1-4.6-3.9c-.5-.8-.8-1.6-.8-2.2 0-.8.2-1.3.5-1.8z"/>';

})();
