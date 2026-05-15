export interface UserCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileBase64: string;
  birthDay: string;
  occupation: string;
  gender: string;
}

export interface UserCreateResponse {
  id: number;
}
