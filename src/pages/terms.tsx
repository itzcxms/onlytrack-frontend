import React from "react";

const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">
        Conditions d'Utilisation - FanFlowHub
      </h1>

      <div className="prose prose-slate dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            En utilisant FanFlowHub (ci-après "le Service"), vous acceptez
            d'être lié par les présentes conditions d'utilisation. Le Service
            est fourni par FanFlowHub, une plateforme de gestion destinée aux
            agences OFM.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. Utilisation du Service
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Vous devez être âgé d'au moins 18 ans pour utiliser ce Service.
            </li>
            <li>
              Vous êtes responsable de maintenir la confidentialité de votre
              compte.
            </li>
            <li>
              Vous acceptez de ne pas utiliser le Service à des fins illégales.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. Protection des Données
          </h2>
          <p>
            Nous nous engageons à protéger vos données conformément au RGPD et
            autres réglementations applicables. Pour plus d'informations,
            consultez notre politique de confidentialité.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            4. Limitation de Responsabilité
          </h2>
          <p>
            FanFlowHub n'est pas responsable des pertes ou dommages résultant de
            l'utilisation du Service. Le Service est fourni "tel quel" sans
            garantie d'aucune sorte.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Modifications</h2>
          <p>
            Nous nous réservons le droit de modifier ces conditions à tout
            moment. Les modifications seront effectives dès leur publication sur
            cette page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Contact</h2>
          <p>
            Pour toute question concernant ces conditions d'utilisation,
            veuillez nous contacter à : legal@fanflowhub.com
          </p>
        </section>

        <footer className="mt-12 text-sm text-gray-600">
          <p>Dernière mise à jour : {new Date().toLocaleDateString()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Terms;
