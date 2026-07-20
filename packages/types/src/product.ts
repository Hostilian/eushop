interface Product {
    id: number;
    title: string;
    description: string;
    gpsr: {
        manufacturerName: string;
        manufacturerAddress: string;
        safetyContact: string;
    };
}