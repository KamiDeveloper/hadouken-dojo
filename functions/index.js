const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

/**
 * Cloud Function para manejar el intercambio de rangos (Rank Swap)
 * Se dispara cuando un documento en 'matches' es actualizado a status 'completed'
 */
exports.handleMatchCompletion = onDocumentUpdated("matches/{matchId}", async (event) => {
    const newData = event.data.after.data();
    const previousData = event.data.before.data();

    // Solo ejecutar si el status cambió a 'completed'
    if (newData.status === 'completed' && previousData.status !== 'completed') {
        const { challengerId, defenderId, scoreChallenger, scoreDefender, gameId } = newData;

        // Verificar quién ganó
        const challengerWon = scoreChallenger > scoreDefender;

        if (challengerWon) {
            try {
                await db.runTransaction(async (transaction) => {
                    const challengerRef = db.doc(`leagues/${gameId}/players/${challengerId}`);
                    const defenderRef = db.doc(`leagues/${gameId}/players/${defenderId}`);

                    const challengerDoc = await transaction.get(challengerRef);
                    const defenderDoc = await transaction.get(defenderRef);

                    if (!challengerDoc.exists || !defenderDoc.exists) {
                        throw new Error("Player document does not exist!");
                    }

                    const challengerRank = challengerDoc.data().rank;
                    const defenderRank = defenderDoc.data().rank;

                    // Lógica de intercambio: Solo si el retador tiene peor rango (número mayor)
                    // Ejemplo: Retador (Rank 10) gana a Defensor (Rank 5) -> Swap
                    if (challengerRank > defenderRank) {
                        transaction.update(challengerRef, { rank: defenderRank });
                        transaction.update(defenderRef, { rank: challengerRank });
                        console.log(`Ranks swapped: ${challengerId} (${challengerRank} -> ${defenderRank}) vs ${defenderId} (${defenderRank} -> ${challengerRank})`);
                    } else {
                        console.log('Challenger won but was already higher rank. No swap.');
                    }
                });
            } catch (error) {
                console.error("Transaction failed: ", error);
            }
        } else {
            console.log('Defender won. No rank change.');
        }
    }
});
