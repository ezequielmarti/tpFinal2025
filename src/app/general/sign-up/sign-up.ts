import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ERole, getRoleGroup } from '../../../enum/role';
import { CreateAdminSchema, CreateBusinessSchema, CreateUserSchema } from '../../../schema/user/create-account';
import { AuthService } from '../login/auth-managment';
import { AccountCreation } from './account-creation';

type AllowedRole = ERole.User | ERole.Business | ERole.Admin;
type RoleGroup = 'user' | 'business' | 'admin';
type SignUpForm = FormGroup<{
  email: FormControl<string>;
  username: FormControl<string>;
  password: FormControl<string>;
  firstname: FormControl<string>;
  lastname: FormControl<string>;
  birth: FormControl<string | null>;
  phone: FormControl<string>;
  title: FormControl<string>;
  bio: FormControl<string>;
  contactEmail: FormControl<string | null>;
  publicName: FormControl<string>;
}>;

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUp {
  private readonly fb = inject(FormBuilder);
  readonly accountSignal = inject(AccountCreation);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly Role = ERole;
  readonly accountType = signal<AllowedRole | null>(null);
  readonly accountGroup = computed<RoleGroup | null>(() => {
    const role = this.accountType();
    return role ? getRoleGroup(role) : null;
  });
  readonly isBusy = computed(() => this.accountSignal.creationState().loading || this.auth.authState().loading);

  readonly form: SignUpForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstname: [''],
    lastname: [''],
    birth: this.fb.control<string | null>(null),
    phone: [''],
    title: [''],
    bio: [''],
    contactEmail: this.fb.control<string | null>(null, Validators.email),
    publicName: [''],
  });

  constructor() {
    this.accountSignal.resetState();

    effect(() => {
      const authState = this.auth.authState();
      if (authState.logged && !authState.loading) {
        this.router.navigate(['/account']);
      }
    });
  }

  onSelectAccount(role: AllowedRole): void {
    if (this.accountType() === role) return;
    this.accountType.set(role);
    this.accountSignal.resetState();
    this.form.reset(this.initialValues());
    this.applyRoleValidators();
  }

  onChangeAccountType(): void {
    this.accountType.set(null);
    this.accountSignal.resetState();
    this.form.reset(this.initialValues());
    this.clearRoleValidators();
  }

  onSubmit(): void {
    const role = this.accountType();
    const group = this.accountGroup();
    if (!role || !group || this.isBusy()) return;

    this.applyRoleValidators();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload(group, role);
    this.accountSignal.createAccount(payload);
  }

  // Getters para usar en el template
  get email() { return this.form.controls.email; }
  get username() { return this.form.controls.username; }
  get password() { return this.form.controls.password; }
  get firstname() { return this.form.controls.firstname; }
  get lastname() { return this.form.controls.lastname; }
  get phone() { return this.form.controls.phone; }
  get title() { return this.form.controls.title; }
  get contactEmail() { return this.form.controls.contactEmail; }
  get publicName() { return this.form.controls.publicName; }

  private applyRoleValidators(): void {
    this.clearRoleValidators();
    const group = this.accountGroup();
    const { firstname, lastname, phone, title, publicName } = this.form.controls;

    if (group === 'user') {
      firstname.setValidators([Validators.required]);
      lastname.setValidators([Validators.required]);
    } else if (group === 'business') {
      title.setValidators([Validators.required]);
      phone.setValidators([Validators.required]);
    } else if (group === 'admin') {
      publicName.setValidators([Validators.required]);
    }

    [firstname, lastname, phone, title, publicName].forEach(ctrl =>
      ctrl.updateValueAndValidity({ emitEvent: false })
    );
  }

  private clearRoleValidators(): void {
    const { firstname, lastname, phone, title, publicName } = this.form.controls;
    [firstname, lastname, phone, title, publicName].forEach(ctrl => {
      ctrl.clearValidators();
      ctrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  private initialValues() {
    return {
      email: '',
      username: '',
      password: '',
      firstname: '',
      lastname: '',
      birth: null,
      phone: '',
      title: '',
      bio: '',
      contactEmail: null,
      publicName: '',
    };
  }

  private buildPayload(group: RoleGroup, role: AllowedRole): CreateUserSchema | CreateBusinessSchema | CreateAdminSchema {
    const v = this.form.getRawValue();
    const base = {
      email: v.email.trim(),
      username: v.username.trim(),
      password: v.password,
      role,
    };

    if (group === 'user') {
      return {
        ...base,
        firstname: v.firstname.trim(),
        lastname: v.lastname.trim(),
        birth: this.cleanOptional(v.birth),
        phone: this.cleanOptional(v.phone),
      };
    }

    if (group === 'business') {
      return {
        ...base,
        title: v.title.trim(),
        bio: this.cleanOptional(v.bio),
        phone: v.phone.trim(),
        contactEmail: this.cleanOptional(v.contactEmail),
      };
    }

    return {
      ...base,
      publicName: v.publicName.trim(),
    };
  }

  private cleanOptional(value: string | null): string | undefined {
    if (value === null) return undefined;
    const t = value.trim();
    return t ? t : undefined;
  }
}
