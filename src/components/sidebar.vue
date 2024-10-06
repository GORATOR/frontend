<template>
    <div class="row" style="height: 100vh;">
        <div class="col-md-3" style="background-color: indigo;">
            <div class="p-3 m-0 border-0">
                <div class="d-grid gap-2">
                    <button class="btn btn-outline-light btn-sm text-start" type="button">Issues</button>
                    <button class="btn btn-outline-light btn-sm text-start" type="button">Projects</button>
                </div>
            </div>
        </div>
        <div class="col-md-9">
            <slot></slot>
        </div>
    </div>
</template>