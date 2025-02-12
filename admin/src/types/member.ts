export enum PaymentStatus {
    archived = "Arquivado",
    paid = "Pago",
    pending = "Pendente"
}

export enum CardStatus {
    active = "Ativo",
    inactive = "Inativo"
}

export type Member = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    registrationDate: string;
    course: string;
    studentNumber: string;
    address: string;
    postalCode: string;
    cardStatus: CardStatus;
    paymentStatus: PaymentStatus;
    locality: string;
    country: string;
    birthDate: string;
    nextPayment: string;
    citizenCard: string;
    nif: string;
    phoneNumber: string;
}
