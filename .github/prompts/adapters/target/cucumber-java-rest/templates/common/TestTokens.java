package __PACKAGE__.shared.cucumber;

public final class TestTokens {

    private TestTokens() {}

    public static String admin() {
        // TODO: brancher le fournisseur de jetons de test détecté au setup
        // (clé de signature statique, ou faux fournisseur d'identité). Voir le catalogue du framework.
        throw new UnsupportedOperationException("Test token provider not wired");
    }
}
