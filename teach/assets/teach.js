/* ============================================================
   teach.js — behaviour for every teach page.
   Source of truth: ~/.claude/skills/teach/assets/teach.js
   Copied to ~/teach/assets/teach.js. Never edit the copy.

   Reads two manifests, both plain scripts so they work over file://
     ~/teach/courses.js        sets window.COURSES
     <course>/course.js        sets window.COURSE

   Renders, on a lesson page:
     the sidebar from COURSE, the "on this page" rail from the
     h2 headings, and the prev/next bar from COURSE plus the
     body's data-lesson attribute.
   Renders, on a course page: the lesson list from COURSE.
   Renders, on the courses index: the course list from COURSES.
   ============================================================ */

(function () {
  'use strict';

  var body = document.body;
  var page = (body.className.match(/page-(\w+)/) || [])[1];

  /* ---------------- persisted state ---------------- */
  var LS = {
    get: function (k, d) {
      try { var v = localStorage.getItem('teach:' + k); return v === null ? d : JSON.parse(v); }
      catch (e) { return d; }
    },
    set: function (k, v) { try { localStorage.setItem('teach:' + k, JSON.stringify(v)); } catch (e) {} }
  };

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  /* every lesson of a course, flattened out of its chapters */
  function lessons(course) {
    var out = [];
    (course.chapters || []).forEach(function (c) {
      (c.lessons || []).forEach(function (l) { out.push(l); });
    });
    return out;
  }

  /* ---------------- controls: theme, sidebar, rail ---------------- */
  var ctl = el('div', 'ctl');
  body.appendChild(ctl);

  var dark = LS.get('theme', null);
  if (dark === null) dark = !window.matchMedia('(prefers-color-scheme: light)').matches;
  body.classList.toggle('light', !dark);
  var tTheme = el('button', null, '◐ theme');
  tTheme.title = 'Toggle light and dark';
  tTheme.onclick = function () {
    dark = body.classList.toggle('light') === false;
    LS.set('theme', dark);
  };

  if (page === 'lesson') {
    [['☰ side', 'no-side', 'Toggle the course sidebar'],
     ['☱ rail', 'no-rail', 'Toggle the contents rail']].forEach(function (p) {
      var btn = el('button', null, p[0]);
      btn.title = p[2];
      var hidden = LS.get(p[1], false);
      body.classList.toggle(p[1], hidden);
      btn.classList.toggle('off', hidden);
      btn.onclick = function () {
        var h = body.classList.toggle(p[1]);
        btn.classList.toggle('off', h);
        LS.set(p[1], h);
      };
      ctl.appendChild(btn);
    });
  }
  ctl.appendChild(tTheme);

  /* ---------------- courses index ---------------- */
  if (page === 'index' && window.COURSES) {
    var list = el('ul', 'course-list');
    window.COURSES.forEach(function (c) {
      var li = el('li');
      var a = el('a', 'course' + (c.idle ? ' idle' : ''));
      a.href = c.slug + '/index.html';
      var count = c.lessons === 1 ? '1 lesson' : (c.lessons || 0) + ' lessons';
      a.innerHTML =
        '<div class="t"><h2>' + esc(c.title) + '</h2><span class="n">' +
        esc(c.note || count) + '</span></div>' +
        '<p>' + (c.tag ? '<span class="tag">' + esc(c.tag) + '</span> ' : '') + esc(c.why) + '</p>' +
        (c.latest ? '<div class="last">Latest · <b>' + esc(c.latest) + '</b></div>' : '');
      li.appendChild(a);
      list.appendChild(li);
    });
    var host = document.querySelector('[data-courses]');
    if (host) host.appendChild(list);
  }

  /* ---------------- course page: the lesson list ---------------- */
  if (page === 'course' && window.COURSE) {
    var course = window.COURSE;
    var host2 = document.querySelector('[data-toc]');
    if (host2) {
      (course.chapters || []).forEach(function (ch) {
        if (ch.name) host2.appendChild(el('div', 'grp', esc(ch.name)));
        var ol = el('ol', 'toc');
        (ch.lessons || []).forEach(function (l) {
          var li = el('li');
          li.innerHTML =
            '<a href="lessons/' + esc(l.file) + '"><span class="n">' + esc(l.n) + '</span>' +
            '<span><b>' + esc(l.title) + '</b>' +
            (l.summary ? '<span class="s">' + esc(l.summary) + '</span>' : '') + '</span></a>';
          ol.appendChild(li);
        });
        host2.appendChild(ol);
      });
    }
    var host3 = document.querySelector('[data-reference]');
    if (host3 && (course.reference || []).length) {
      (course.reference).forEach(function (r) {
        var a = el('a', null, esc(r.title));
        a.href = r.file;
        host3.appendChild(a);
      });
    }
  }

  /* ---------------- lesson page ---------------- */
  if (page === 'lesson') {
    var c2 = window.COURSE;
    var here = body.dataset.lesson;

    /* sidebar */
    var side = document.querySelector('nav.side');
    if (side && c2) {
      var up = el('a', 'up', '← Courses');
      up.href = '../../index.html';
      side.appendChild(up);
      var title = el('a', 'course', esc(c2.title));
      title.href = '../index.html';
      side.appendChild(title);

      (c2.chapters || []).forEach(function (ch) {
        if (ch.name) side.appendChild(el('div', 'grp', esc(ch.name)));
        var ol = el('ol');
        (ch.lessons || []).forEach(function (l) {
          var li = el('li');
          li.innerHTML = '<a class="' + (l.file === here ? 'here' : '') + '" href="' + esc(l.file) +
                         '"><span class="n">' + esc(l.n) + '</span> ' + esc(l.title) + '</a>';
          ol.appendChild(li);
        });
        side.appendChild(ol);
      });

      if ((c2.reference || []).length) {
        side.appendChild(el('div', 'grp', 'Reference'));
        var refs = el('div', 'refs');
        c2.reference.forEach(function (r) {
          var a = el('a', null, esc(r.title));
          a.href = '../' + r.file;
          refs.appendChild(a);
        });
        side.appendChild(refs);
      }
    }

    /* prev / next, from the flattened lesson order */
    var pn = document.querySelector('.pn');
    if (pn && c2) {
      var all = lessons(c2), i = -1;
      all.forEach(function (l, n) { if (l.file === here) i = n; });
      if (i > 0) {
        var p = all[i - 1], pa = el('a', 'prev',
          '<span>Previous</span><b>' + esc(p.n) + ' · ' + esc(p.title) + '</b>');
        pa.href = p.file;
        pn.appendChild(pa);
      }
      if (i > -1 && i < all.length - 1) {
        var nx = all[i + 1], na = el('a', 'next',
          '<span>Next</span><b>' + esc(nx.n) + ' · ' + esc(nx.title) + '</b>');
        na.href = nx.file;
        pn.appendChild(na);
      }
    }

    /* on this page, built from the section headings */
    var secs = [].slice.call(document.querySelectorAll('.sec[id]'));
    var rail = document.querySelector('aside.rail');
    var links = [];
    if (rail && secs.length) {
      rail.appendChild(el('div', 'grp', 'On this page'));
      secs.forEach(function (s) {
        var h = s.querySelector('h2');
        var a = el('a', null, esc(h ? h.textContent : s.id));
        a.href = '#' + s.id;
        rail.appendChild(a);
        links.push(a);
      });
      var onScroll = function () {
        var i = 0;
        secs.forEach(function (s, n) { if (s.getBoundingClientRect().top < 120) i = n; });
        links.forEach(function (a, n) { a.classList.toggle('here', n === i); });
      };
      addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* folding sections, remembered per lesson */
    var fkey = 'fold:' + location.pathname, folded = LS.get(fkey, []);
    secs.forEach(function (s) {
      if (folded.indexOf(s.id) > -1) s.classList.add('fold');
      var h = s.querySelector('h2');
      if (!h) return;
      h.onclick = function () {
        s.classList.toggle('fold');
        LS.set(fkey, [].map.call(document.querySelectorAll('.sec.fold'),
                                 function (x) { return x.id; }));
      };
    });
  }

  /* ---------------- quiz ---------------- */
  document.querySelectorAll('.quiz').forEach(function (q) {
    var bs = q.querySelectorAll('button'), why = q.querySelector('.why');
    bs.forEach(function (b) {
      b.onclick = function () {
        var ok = b.dataset.k === q.dataset.a;
        bs.forEach(function (x) { x.classList.remove('right', 'wrong'); });
        b.classList.add(ok ? 'right' : 'wrong');
        if (why) {
          why.textContent = (ok ? 'Correct. ' : 'Not quite. ') + (b.dataset.why || '');
          why.className = 'why ' + (ok ? 'ok' : 'no');
        }
      };
    });
  });

  /* ---------------- checklist, remembered per page ---------------- */
  var boxes = document.querySelectorAll('.check input[type=checkbox]');
  if (boxes.length) {
    var ckey = 'check:' + location.pathname, saved = LS.get(ckey, []);
    boxes.forEach(function (b, i) {
      b.checked = !!saved[i];
      b.onchange = function () {
        LS.set(ckey, [].map.call(boxes, function (x) { return x.checked; }));
      };
    });
  }
})();
