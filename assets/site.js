/* Autoflex — subtle motion: sections ease in once as they scroll into view,
   and the booking tracker steps through its stages while it is on screen.
   Everything stays visible and static for visitors who prefer reduced motion. */
(function () {
  var d = document, root = d.documentElement;
  root.classList.add("rv");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = "IntersectionObserver" in window;

  // 1. Reveal on scroll (the hidden starting state is set in site.css under html.js)
  var els = [].slice.call(d.querySelectorAll(".hero-copy, .hero .ticket, main .section > .wrap > *"));
  if (reduce || !io) {
    els.forEach(function (e) { e.classList.add("rv-in"); });
  } else {
    var ob = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("rv-in"); ob.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    els.forEach(function (e) { ob.observe(e); });
  }

  // 2. Booking tracker: Booked -> Accepted -> On the way -> Done, then holds and repeats
  var tr = d.querySelector("[data-tracker]");
  if (!tr || reduce || !io) return; // without motion the tracker shows every stage complete
  var st = [].slice.call(tr.querySelectorAll(".stage")), n = st.length, c = 0, timer = null;
  function show(k) {
    st.forEach(function (s, i) {
      s.classList.toggle("done", i < k || (k === n - 1 && i === k));
      s.classList.toggle("current", i === k);
    });
    tr.classList.toggle("complete", k === n - 1);
  }
  function step() {
    c = (c + 1) % (n + 2);           // the last stage holds for three beats
    if (c === 0) {
      tr.classList.add("reset");
      show(0);
      requestAnimationFrame(function () { requestAnimationFrame(function () { tr.classList.remove("reset"); }); });
    } else {
      show(Math.min(c, n - 1));
    }
  }
  tr.classList.add("live");
  show(0);
  new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { if (!timer) timer = setInterval(step, 1400); }
      else { clearInterval(timer); timer = null; }
    });
  }, { threshold: 0.35 }).observe(tr);
})();
