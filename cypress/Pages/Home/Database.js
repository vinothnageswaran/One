export function waitforgetGeneration() {    
    cy.task("getGenerationStatus").then(result => {
        console.log(result.recordset[0].generationstatus);
        const status = result.recordset[0].generationstatus;
        if (status === "GENERATED" || status === "ERROR")
            return;

        cy.wait(5000);
        waitforgetGeneration();
    });
};