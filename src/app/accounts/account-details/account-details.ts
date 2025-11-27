import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ERole, getRoleGroup } from '../../../enum/role';
import { AccountDetailsService } from './account-details-service';
import { AuthService } from '../../general/login/auth-managment';
import { UpdateAdminSchema, UpdateBusinessSchema, UpdateUserSchema } from '../../../schema/user/create-account';

@Component({
  selector: 'app-account-details',
  imports: [ReactiveFormsModule],
  templateUrl: './account-details.html',
  styleUrl: './account-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDetails {
  protected readonly accountSignal = inject(AccountDetailsService);
  protected readonly authSignal = inject(AuthService);
  protected readonly router = inject(Router);

  readonly getRoleGroup = getRoleGroup;
  readonly Role = ERole;
  readonly edit = signal(false);

  protected readonly authState = computed(() => this.authSignal.authState());
  protected readonly accountState = computed(() => this.accountSignal.accountState());

  private fetched = false;
  readonly userForm: FormGroup<{
    firstname: FormControl<string>;
    lastname: FormControl<string>;
    phone: FormControl<string>;
    birth: FormControl<string>;
  }>;

  readonly businessForm: FormGroup<{
    title: FormControl<string>;
    contactEmail: FormControl<string>;
    bio: FormControl<string>;
    phone: FormControl<string>;
  }>;

  readonly adminForm: FormGroup<{
    publicName: FormControl<string>;
    email: FormControl<string>;
  }>;

  constructor() {
    const fb = inject(FormBuilder);
    this.userForm = fb.nonNullable.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      phone: [''],
      birth: [''],
    });

    this.businessForm = fb.nonNullable.group({
      title: ['', Validators.required],
      contactEmail: ['', Validators.email],
      bio: [''],
      phone: [''],
    });

    this.adminForm = fb.nonNullable.group({
      publicName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    effect(
      () => {
        const auth = this.authState();
        if (!auth.logged) {
          this.router.navigate(['/']);
          return;
        }
        if (!this.fetched) {
          this.accountSignal.getInfo();
          this.fetched = true;
        }
      },
      { allowSignalWrites: true }
    );

    effect(() => {
      const data = this.accountState().data;
      if (data) {
        if (data.userProfile) {
          this.userForm.reset({
            firstname: data.userProfile.firstname || '',
            lastname: data.userProfile.lastname || '',
            phone: data.userProfile.phone || '',
            birth: data.userProfile.birth ? String(data.userProfile.birth) : '',
          });
        }
        if (data.businessProfile) {
          this.businessForm.reset({
            title: data.businessProfile.title || '',
            contactEmail: data.businessProfile.contactEmail || '',
            bio: data.businessProfile.bio || '',
            phone: data.businessProfile.phone || '',
          });
        }
        if (data.adminProfile) {
          this.adminForm.reset({
            publicName: data.adminProfile.publicName || '',
            email: data.email || '',
          });
        }
      }
    });
  }

  onEditToggle(active: boolean): void {
    this.edit.set(active);
  }

  saveUser(): void {
    const data = this.accountState().data;
    if (!data || !this.userForm.valid) return;
    const value = this.userForm.getRawValue();
    const update: UpdateUserSchema = {
      firstname: value.firstname,
      lastname: value.lastname,
      phone: value.phone || undefined,
      birth: value.birth || undefined,
    };
    this.accountSignal.updateAccount(update);
    this.edit.set(false);
  }

  saveBusiness(): void {
    const data = this.accountState().data;
    if (!data || !this.businessForm.valid) return;
    const value = this.businessForm.getRawValue();
    const update: UpdateBusinessSchema = {
      title: value.title,
      contactEmail: value.contactEmail || undefined,
      bio: value.bio || undefined,
      phone: value.phone || undefined,
    };
    this.accountSignal.updateAccount(update);
    this.edit.set(false);
  }

  saveAdmin(): void {
    const data = this.accountState().data;
    if (!data || !this.adminForm.valid) return;
    const value = this.adminForm.getRawValue();
    const update: UpdateAdminSchema = {
      publicName: value.publicName,
      email: value.email,
    };
    this.accountSignal.updateAccount(update);
    this.edit.set(false);
  }

  requestSeller(): void {
    const data = this.accountState().data;
    if (!data || data.role !== ERole.User) return;
    const confirmChange = confirm('Tu cuenta pasar\u00e1 a seller y no podr\u00e1 volver a solo comprador. \u00bfConfirmas el cambio?');
    if (!confirmChange) return;
    const title =
      (data.userProfile?.firstname || data.userProfile?.lastname)
        ? `${data.userProfile?.firstname || ''} ${data.userProfile?.lastname || ''}`.trim()
        : data.username;
    const contactEmail = data.email;
    this.accountSignal.requestSellerUpgrade({
      title,
      contactEmail,
    });
  }
}
