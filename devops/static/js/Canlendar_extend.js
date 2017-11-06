$(function(){
  setTimeout("load_Calendar()",200)
})
function load_Calendar(){
      $('#calendar').fullCalendar({
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay'
        },
        events: window.plan_events,
   })
 }
