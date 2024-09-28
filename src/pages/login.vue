<template>
    <div class="container">
        <div class="row justify-content-end">
            <div class="col-1">
                <select class="form-select" v-model="$i18n.locale">
                    <option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">
                        {{ locale }}
                    </option>
                </select>
            </div>
        </div>
    </div>
    <div class="row justify-content-center">
        <form class="col-md-4">
            <div>
                <label for="inputLogin" class="form-label">{{ $t('login.login_field') }}</label>
                <input type="text" class="form-control" id="inputLogin" />
            </div>
            <div>
                <label for="inputPassword" class="form-label">{{ $t('login.password_field') }}</label>
                <input type="password" class="form-control" id="inputPassword">
            </div>
            <div class="py-3">
                <button type="submit" class="btn btn-primary">{{ $t('login.submit') }}</button>
            </div>
        </form>
    </div>
</template>