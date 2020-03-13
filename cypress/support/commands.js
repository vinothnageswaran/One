import { max } from 'lodash';
import moment from 'moment'

Cypress.Commands.add('typeLogin', (user) => {
  console.log(user.email)
  console.log(user.password)

}),

  Cypress.Commands.add('verifytext', (UIelements) => {

    cy.get(UIelements.objecttobeverified).contains(UIelements.texttobeverified)
  }),

  Cypress.Commands.add('getPortarrivaltime', (datasetid) => {

    let portarrtime;
    cy
      .request({
        url: 'http://iorper-lstt01:9092/api/Port/' + datasetid,
      })
      .then((resp) => {
        let portArrivalTime = max(resp.body.rakes.map((p) => p.portArrivalTime));

        console.log(portArrivalTime)
        let portarrivaltimeformatted = moment(portArrivalTime).format('Do MMM, HH:mm');
        portarrtime = portarrivaltimeformatted;

        cy.wrap(portarrtime).as('pportarrtime');


      });



  }),


  Cypress.Commands.add('getSailtime', (scenarioid) => {

    let sailtimeformatted
    cy
      .request({
        url: 'http://iorper-lstt01:9092/api/scenarios/' + scenarioid,
      })
      .then((resp) => {

        let pobOut = max(resp.body.nominationAllocations.map((n) => n.pobOut));
        let sailtime = pobOut.eventTime.toString();;
        let sailtimeformatted = moment(sailtime).format('Do MMM, HH:mm');


        cy.wrap(sailtimeformatted).as('wsailtimeformatted');


      })



  }),

  Cypress.Commands.add('getRequiredtimetodumper', (scenarioid,datasetid) => {
    cy
      .request({
        url: 'http://iorper-lstt01:9092/api/scenarios/' + scenarioid,
      })
      .then((resp) => {

        let allocationStart = max(resp.body.rakeAllocations.map((r) => r.allocationStart));
        let allocationStarttime = allocationStart.toString();
        let allocationStarttimeformatted = moment(allocationStarttime).format('Do MMM, HH:mm');
        var allocationendtime = moment(allocationStarttime).add(3, 'hours').format('YYYY-MM-DD HH:mm:ss')
        var allocationendtimehoursonly = moment(allocationendtime).format('HH:mm')
        var scheduleddumptimevalue = allocationStarttimeformatted + ' - ' + allocationendtimehoursonly
        //cy.verifytext({ objecttobeverified: elements.Sidebar.ScheduledDumpTimev, texttobeverified: scheduleddumptimevalue });
        cy.wrap(scheduleddumptimevalue).as('wscheduleddumptimevalue');
        console.log('allocationStarttimeformatted ' + allocationStarttimeformatted);


        cy
          .request({
            url: 'http://iorper-lstt01:9092/api/Port/' + datasetid,
          })
          .then((resp) => {
            let portArrivalTime = max(resp.body.rakes.map((p) => p.portArrivalTime));

            //let portarrivaltime = grades.portArrivalTime;
            let portarrivaltimeformatted = moment(portArrivalTime).format('Do MMM, HH:mm');


            var startTime = moment(portarrivaltimeformatted, "Do MMM, HH:mm:ss");
            var endTime = moment(allocationStarttimeformatted, "Do MMM, HH:mm:ss");

            console.log('portArrivalTime' + portArrivalTime);
            console.log('allocationStarttime' + allocationStarttime);


            // calculate total duration

            if (startTime < endTime) {
              var duration = moment.duration(endTime.diff(startTime));
            }

            else {
              var duration = moment.duration(startTime.diff(endTime));

            }

            // duration in hours
            var hours = parseInt(duration.asHours());

            // duration in minutes
            var minutes = parseInt(duration.asMinutes()) % 60; // Required dumper time ; Difference between port arrival time and allocation start time

            let requiredtimetodumper = hours + 'h ' + minutes + 'm';

            cy.wrap(requiredtimetodumper).as('wrequiredtimetodumper');
            // cy.verifytext({ objecttobeverified: elements.Sidebar.RequiredTimeToDumperv, texttobeverified: hours + 'h ' + minutes + 'm' });

          })

      })

  }),

  Cypress.Commands.add('getscheduleddumptimevalue', (datasetid) => {
    cy
      .request({
        url: 'http://iorper-lstt01:9092/api/Port/' + datasetid,
      })
      .then((resp) => {

        let allocationStart = max(resp.body.rakeAllocations.map((r) => r.allocationStart));
        let allocationStarttime = allocationStart.toString();
        let allocationStarttimeformatted = moment(allocationStarttime).format('Do MMM, HH:mm');
        var allocationendtime = moment(allocationStarttime).add(3, 'hours').format('YYYY-MM-DD HH:mm:ss')
        var allocationendtimehoursonly = moment(allocationendtime).format('HH:mm')
        var scheduleddumptimevalue = allocationStarttimeformatted + ' - ' + allocationendtimehoursonly
       
        cy.wrap(scheduleddumptimevalue).as('wscheduleddumptimevalue');
        //console.log('allocationStarttimeformatted ' + allocationStarttimeformatted);

      })

  }),



  Cypress.Commands.add('waitforGenerationStatus', () => {


    let status;
    cy.task("getGenerationStatus").then(result => {

      cy.log(result)
      let waited = false;

      status = result;
      while (status != 'GENERATED' && status != 'ERROR') {
        cy.wait(60000);
        cy.task("getGenerationStatus").then(currentstatus => {

          status = currentstatus;

          console.log("Generation Status "+ status);
          if(status == "ERROR"){

            console.log('Generation error')
            Cypress.runner.stop()
            throw error;
  
          }

        })

       

        break;

      }
    })

    // return status;

  })






